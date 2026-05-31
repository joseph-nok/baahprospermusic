import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

const http = httpRouter()

http.route({
  path: '/flutterwave-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // 1. Security Check: Read the 'verif-hash' header sent by Flutterwave
    const signature = request.headers.get('verif-hash')
    const secretHash = process.env.FLW_SECRET_HASH

    if (!secretHash || !signature || signature !== secretHash) {
      console.error(
        '[FLUTTERWAVE WEBHOOK] Signature verification failed or missing.',
      )
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. Parse the request payload
    let payload
    try {
      payload = await request.json()
    } catch (error) {
      console.error('[FLUTTERWAVE WEBHOOK] Failed to parse JSON body:', error)
      return new Response('Invalid JSON', { status: 400 })
    }

    // 3. Event Validation: Process only if event is "charge.completed" and status is "successful"
    const event = payload.event
    const data = payload.data

    if (event === 'charge.completed' && data?.status === 'successful') {
      // 4. Data Extraction
      const amount = Number(data.amount)
      const currency = String(data.currency || 'GHS')
      const customerName = String(data.customer?.name || 'Customer')
      const customerEmail = String(data.customer?.email || '')

      // Safely extract the itemized string from metadata
      const orderItems = String(
        data.meta?.order_items || 'No order details provided',
      )

      // Extract transaction ID for the receipt
      const transactionId = String(
        data.tx_ref || data.flw_ref || data.id || 'N/A',
      )

      // Extract checkout ID from reference or metadata
      const reference = String(data.tx_ref || '')
      const checkoutId = (
        data.meta?.checkout_id ||
        reference.split('_')[0] ||
        ''
      ).trim()

      console.log(
        `[FLUTTERWAVE WEBHOOK] Processing successful order: ${transactionId} - ${customerName} (${currency} ${amount})`,
      )

      // 4b. Update checkout status in database to 'paid'
      if (checkoutId) {
        try {
          await ctx.runMutation(internal.commerce.completePaymentInternal, {
            checkoutId: checkoutId,
          })
          console.log(
            `[FLUTTERWAVE WEBHOOK] Marked checkout ${checkoutId} as PAID.`,
          )
        } catch (dbError) {
          console.error(
            `[FLUTTERWAVE WEBHOOK] Failed to update checkout database status:`,
            dbError,
          )
        }
      }

      // 5. Pass all clean data to the internal payments process action
      try {
        await ctx.runAction(internal.payments.processSuccessfulOrder, {
          amount,
          currency,
          customerName,
          customerEmail,
          orderItems,
          transactionId,
        })
      } catch (actionError) {
        console.error(
          '[FLUTTERWAVE WEBHOOK] Failed to run internal process action:',
          actionError,
        )
        // We still return 200 to prevent retries if the webhook payload itself was valid
      }
    } else {
      console.log(
        `[FLUTTERWAVE WEBHOOK] Ignored event: ${event}, status: ${data?.status}`,
      )
    }

    // 6. Return HTTP 200 OK response instantly to prevent retries
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),
})

export default http
