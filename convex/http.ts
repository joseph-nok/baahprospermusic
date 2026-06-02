import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

const http = httpRouter()

// =====================================================================
// HMAC SHA-512 signature verification using Web Crypto API
// (Convex default runtime — no Node.js 'crypto' available here)
// =====================================================================

async function verifyPaystackSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const hashHex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hashHex === signature
}

// =====================================================================
// Paystack Webhook — handles charge.success events
// =====================================================================

http.route({
  path: '/paystack-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // 1. Security: Verify the x-paystack-signature header
    const signature = request.headers.get('x-paystack-signature')
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey || !signature) {
      console.error(
        '[PAYSTACK WEBHOOK] Missing secret key or signature header.',
      )
      return new Response('Unauthorized', { status: 401 })
    }

    const rawBody = await request.text()

    const isValid = await verifyPaystackSignature(rawBody, signature, secretKey)
    if (!isValid) {
      console.error('[PAYSTACK WEBHOOK] HMAC signature verification failed.')
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. Parse the verified payload
    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch (error) {
      console.error('[PAYSTACK WEBHOOK] Failed to parse JSON body:', error)
      return new Response('Invalid JSON', { status: 400 })
    }

    // 3. Only process charge.success events
    const event = payload.event
    if (event === 'charge.success') {
      // data.reference is our Convex checkout _id
      const reference = String(payload.data?.reference || '')
      const amount = Number(payload.data?.amount || 0) / 100 // pesewas → GHS
      const currency = String(payload.data?.currency || 'GHS')
      const customerEmail = String(payload.data?.customer?.email || '')
      const customerName = String(
        payload.data?.metadata?.customer_name ||
          payload.data?.customer?.first_name ||
          'Customer',
      )
      const orderItems = String(
        payload.data?.metadata?.order_items || 'No order details provided',
      )
      const transactionId = String(payload.data?.id || reference)

      console.log(
        `[PAYSTACK WEBHOOK] Processing charge.success: ref=${reference} — ${customerName} (${currency} ${amount})`,
      )

      // 4. Mark checkout as paid in the Convex database
      if (reference) {
        try {
          await ctx.runMutation(internal.commerce.completePaymentInternal, {
            checkoutId: reference as any,
          })
          console.log(
            `[PAYSTACK WEBHOOK] Marked checkout ${reference} as PAID.`,
          )
        } catch (dbError) {
          console.error(
            `[PAYSTACK WEBHOOK] Failed to update checkout status:`,
            dbError,
          )
        }
      }

      // 5. Send order notification email via internal action
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
          '[PAYSTACK WEBHOOK] Failed to run email notification action:',
          actionError,
        )
        // Still return 200 — the payment was processed successfully
      }
    } else {
      console.log(`[PAYSTACK WEBHOOK] Ignored event: ${event}`)
    }

    // 6. Always return 200 to Paystack to prevent retries
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),
})

export default http
