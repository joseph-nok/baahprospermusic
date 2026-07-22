import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

type PaymentCallbackSearch = {
  reference: string
  trxref: string
  cancelled: string
}

export const Route = createFileRoute('/payment-callback')({
  validateSearch: (
    search: Record<string, unknown>,
  ): PaymentCallbackSearch => ({
    reference:
      typeof search.reference === 'string' ? search.reference : '',
    trxref: typeof search.trxref === 'string' ? search.trxref : '',
    cancelled:
      typeof search.cancelled === 'string' ? search.cancelled : '',
  }),
  component: PaymentCallbackPage,
})

function PaymentCallbackPage() {
  const navigate = useNavigate()
  const convexApi = api as any
  const { reference, trxref, cancelled } = Route.useSearch()

  // Paystack returns reference= or trxref= — both contain our Convex checkout _id
  const checkoutId = reference || trxref || ''

  const checkout = useQuery(
    convexApi.commerce.getCheckout,
    checkoutId ? { checkoutId: checkoutId as Id<'checkouts'> } : 'skip',
  )
  const verifyPayment = useAction(convexApi.commerce.verifyPaystackPayment)

  const [verifyState, setVerifyState] = useState<
    'idle' | 'verifying' | 'success' | 'failed' | 'cancelled'
  >('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const verifyAttempted = useRef(false)

  const wasCancelled = cancelled === 'true'

  useEffect(() => {
    if (wasCancelled) {
      setVerifyState('cancelled')
      return
    }

    // If already paid (webhook already processed), show success
    if (checkout?.status === 'paid') {
      setVerifyState('success')
      return
    }

    if (
      verifyAttempted.current ||
      !checkout ||
      !checkoutId
    ) {
      return
    }

    // Attempt verification as a fallback (webhook is primary)
    verifyAttempted.current = true
    setVerifyState('verifying')

    verifyPayment({
      reference: checkoutId,
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
    checkoutId,
    wasCancelled,
    verifyPayment,
  ])

  // ── Loading states ──────────────────────────────────────────────────

  if (!checkoutId && !wasCancelled) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 pb-20 pt-14 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111] p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400">Invalid Request</h1>
          <p className="mt-2 text-sm text-gray-400">
            Invalid payment tracking parameters.
          </p>
        </section>
      </main>
    )
  }

  if (!wasCancelled && checkout === undefined) {
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
                  to: '/cart',
                })
              }
              className="rounded-xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-500"
            >
              Back to Cart
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
