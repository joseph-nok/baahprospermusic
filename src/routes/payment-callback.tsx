import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

type PaymentCallbackSearch = {
  status: string
  tx_ref: string
  transaction_id: string
}

export const Route = createFileRoute('/payment-callback')({
  validateSearch: (
    search: Record<string, unknown>,
  ): PaymentCallbackSearch => ({
    status: typeof search.status === 'string' ? search.status : '',
    tx_ref: typeof search.tx_ref === 'string' ? search.tx_ref : '',
    transaction_id:
      typeof search.transaction_id === 'string'
        ? search.transaction_id
        : '',
  }),
  component: PaymentCallbackPage,
})

function formatPhoneNumber(num: string) {
  if (!num) return num
  const cleaned = num.trim()
  if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    return '0' + cleaned
  }
  return cleaned
}

type CheckoutItemSummary = {
  productName: string
  quantity: number
  color: string
  size: string
}

function formatOrderItemsBreakdown(items: CheckoutItemSummary[] = []) {
  if (!items.length) return 'N/A'

  const headers = ['Qty', 'Item', 'Color', 'Size']
  const rows = items.map((item) => [
    `${item.quantity}x`,
    item.productName.trim() || 'Merch',
    item.color.trim() || 'N/A',
    item.size.trim() || 'N/A',
  ])

  const colWidths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i].length)),
  )

  const pad = (str: string, width: number) => str.padEnd(width, ' ')

  const headerLine = `| ${headers.map((h, i) => pad(h, colWidths[i])).join(' | ')} |`
  const separatorLine = `| ${colWidths.map((w) => '-'.repeat(w)).join(' | ')} |`
  const rowLines = rows.map(
    (row) => `| ${row.map((val, i) => pad(val, colWidths[i])).join(' | ')} |`,
  )

  return [headerLine, separatorLine, ...rowLines].join('\n')
}

function PaymentCallbackPage() {
  const navigate = useNavigate()
  const convexApi = api as any
  const { status, tx_ref, transaction_id } = Route.useSearch()

  // Extract the checkoutId from the tx_ref (format: checkoutId_timestamp)
  const checkoutId = tx_ref ? tx_ref.split('_').slice(0, -1).join('_') : ''

  const checkout = useQuery(
    convexApi.commerce.getCheckout,
    checkoutId ? { checkoutId: checkoutId as Id<'checkouts'> } : 'skip',
  )
  const verifyPayment = useAction(convexApi.commerce.verifyFlutterwavePayment)

  const [verifyState, setVerifyState] = useState<
    'idle' | 'verifying' | 'success' | 'failed' | 'cancelled'
  >('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const verifyAttempted = useRef(false)

  // Determine if payment was cancelled by the user
  const wasCancelled =
    status === 'cancelled' || (!status && !transaction_id)

  useEffect(() => {
    if (wasCancelled) {
      setVerifyState('cancelled')
      return
    }

    if (
      verifyAttempted.current ||
      !checkout ||
      checkout.status === 'paid' ||
      !transaction_id ||
      status !== 'successful'
    ) {
      // If already paid, show success immediately
      if (checkout?.status === 'paid') {
        setVerifyState('success')
      }
      return
    }

    verifyAttempted.current = true
    setVerifyState('verifying')

    const customerName =
      `${checkout.shippingAddress.firstName} ${checkout.shippingAddress.lastName}`.trim()
    const addressParts = [
      checkout.shippingAddress.addressLine1,
      checkout.shippingAddress.city,
      checkout.shippingAddress.region,
      checkout.shippingAddress.country,
    ].filter(Boolean)
    const deliveryAddress = addressParts.join(', ')
    const orderItemsBreakdown = formatOrderItemsBreakdown(
      checkout.items || [],
    )

    verifyPayment({
      transactionId: transaction_id,
      checkoutId: checkoutId as Id<'checkouts'>,
      customerName,
      customerEmail: checkout.email || 'N/A',
      phoneNumber: formatPhoneNumber(
        checkout.shippingAddress.phone || checkout.momoNumber || 'N/A',
      ),
      deliveryInfo: deliveryAddress,
      orderItemsBreakdown,
    })
      .then(() => setVerifyState('success'))
      .catch((err: any) => {
        console.error('Payment verification failed:', err)
        setErrorMsg(
          err?.message || 'Verification failed. Please contact support.',
        )
        setVerifyState('failed')
      })
  }, [
    checkout,
    transaction_id,
    status,
    checkoutId,
    wasCancelled,
    verifyPayment,
  ])

  // ── Loading states ──────────────────────────────────────────────────

  if (!checkoutId || (!wasCancelled && checkout === undefined)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <article className="p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
          <p className="mt-6 text-xl font-bold text-white">
            Processing payment result...
          </p>
        </article>
      </main>
    )
  }

  // ── Cancelled ───────────────────────────────────────────────────────

  if (verifyState === 'cancelled') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 pb-20 pt-14 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-900/30">
            <svg
              className="h-8 w-8 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Payment Cancelled</h1>
          <p className="mt-2 text-sm text-gray-400">
            You cancelled the payment. No charges were made.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                void navigate({
                  to: '/momo-payment',
                  search: { checkoutId },
                })
              }
              className="rounded-xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-500"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => void navigate({ to: '/cart' })}
              className="rounded-xl bg-zinc-800 py-4 font-semibold text-white transition hover:bg-zinc-700"
            >
              Back to Cart
            </button>
          </div>
        </section>
      </main>
    )
  }

  // ── Verifying ───────────────────────────────────────────────────────

  if (verifyState === 'idle' || verifyState === 'verifying') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 pb-20 pt-14 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111] p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
          <h1 className="mt-6 text-2xl font-bold">Verifying Payment</h1>
          <p className="mt-2 text-sm text-gray-400">
            Please wait while we confirm your transaction...
          </p>
        </section>
      </main>
    )
  }

  // ── Failed ──────────────────────────────────────────────────────────

  if (verifyState === 'failed') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 pb-20 pt-14 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-red-900/40 bg-[#111] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-400">
            Verification Failed
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {errorMsg ||
              'We could not verify your payment. If money was deducted, please contact support.'}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void navigate({ to: '/' })}
              className="rounded-xl bg-white py-4 font-semibold text-black transition hover:bg-gray-200"
            >
              Return Home
            </button>
            <button
              type="button"
              onClick={() => void navigate({ to: '/cart' })}
              className="rounded-xl bg-zinc-800 py-4 font-semibold text-white transition hover:bg-zinc-700"
            >
              Back to Cart
            </button>
          </div>
        </section>
      </main>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 pb-20 pt-14 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/30">
          <svg
            className="h-8 w-8 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Success
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          Payment complete
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Your transaction has been processed successfully.
        </p>

        {/* Show summary if checkout data is available */}
        {checkout && (
          <div className="mt-6 space-y-3 text-left">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Amount Paid
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-emerald-400">
                {checkout.currency || 'GHS'}{' '}
                {checkout.totalAmount.toFixed(2)}
              </p>
            </div>
            {checkout.items && checkout.items.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Order Items
                </p>
                <div className="space-y-2 text-sm text-zinc-300">
                  {checkout.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <span className="font-semibold text-white">
                          {item.quantity}x
                        </span>{' '}
                        {item.productName}
                        <span className="block text-xs text-zinc-500">
                          Color: {item.color} | Size: {item.size}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void navigate({ to: '/' })}
            className="rounded-xl bg-white py-4 font-semibold text-black transition hover:bg-gray-200"
          >
            Return Home
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: '/market' })}
            className="rounded-xl bg-zinc-800 py-4 font-semibold text-white transition hover:bg-zinc-700"
          >
            Continue Shopping
          </button>
        </div>
      </section>
    </main>
  )
}
