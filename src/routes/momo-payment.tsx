import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

type MomoPaymentSearch = {
  checkoutId: string
}

export const Route = createFileRoute('/momo-payment')({
  validateSearch: (search: Record<string, unknown>): MomoPaymentSearch => ({
    checkoutId:
      typeof search.checkoutId === 'string' ? search.checkoutId.trim() : '',
  }),
  component: MoMoPaymentPage,
})

type CheckoutItemSummary = {
  productName: string
  quantity: number
  color: string
  size: string
}

function formatPhoneNumber(num: string) {
  if (!num) return num
  const cleaned = num.trim()
  if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    return '0' + cleaned
  }
  return cleaned
}

function MoMoPaymentPage() {
  const navigate = useNavigate()
  const convexApi = api as any
  const { checkoutId } = Route.useSearch()

  const checkout = useQuery(
    convexApi.commerce.getCheckout,
    checkoutId ? { checkoutId: checkoutId as Id<'checkouts'> } : 'skip',
  )
  const initiatePayment = useAction(
    convexApi.commerce.initiateFlutterwaveRedirect,
  )

  const [isPaying, setIsPaying] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // ── Loading ─────────────────────────────────────────────────────────

  if (checkout === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <article className="p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
          <p className="mt-6 text-xl font-bold text-white">
            Loading payment...
          </p>
        </article>
      </main>
    )
  }

  // ── Missing checkout ID ─────────────────────────────────────────────

  if (!checkoutId) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <article className="rounded-xl border border-red-900/50 bg-[#111] p-8 text-center">
          <p className="text-lg font-semibold text-red-400">
            Missing checkout session. Please start again from your cart.
          </p>
          <button
            type="button"
            onClick={() => void navigate({ to: '/cart' })}
            className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
          >
            Return to Cart
          </button>
        </article>
      </main>
    )
  }

  // ── Checkout not found ──────────────────────────────────────────────

  if (checkout === null) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <article className="rounded-xl border border-red-900/50 bg-[#111] p-8 text-center">
          <p className="text-lg font-semibold text-red-400">
            Checkout not found. It may have expired.
          </p>
          <button
            type="button"
            onClick={() => void navigate({ to: '/cart' })}
            className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
          >
            Return to Cart
          </button>
        </article>
      </main>
    )
  }

  // ── Already paid ────────────────────────────────────────────────────

  if (checkout.status === 'paid') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 pb-20 pt-14 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Already Paid
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Payment complete
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            This order has already been paid for.
          </p>
          <PaymentSummary checkout={checkout} className="mt-8 text-left" />
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

  // ── Initiate redirect-based payment ─────────────────────────────────

  const handlePayment = async () => {
    setIsPaying(true)
    setErrorMsg('')

    try {
      // Build the callback URL from the current origin
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://baah-prosper-music.vercel.app'
      const redirectUrl = `${origin}/payment-callback`

      const result = await initiatePayment({
        checkoutId: checkoutId as Id<'checkouts'>,
        redirectUrl,
      })

      if (result.alreadyPaid) {
        // Checkout was already paid — refresh will show the "already paid" UI
        window.location.reload()
        return
      }

      if (result.link) {
        // Redirect the browser to Flutterwave's hosted checkout page
        window.location.href = result.link
      } else {
        setErrorMsg('Could not generate payment link. Please try again.')
        setIsPaying(false)
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error)
      setErrorMsg(
        error?.message ||
          'Payment initiation failed. Please try again or contact support.',
      )
      setIsPaying(false)
    }
  }

  // ── Review & Pay UI ─────────────────────────────────────────────────

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 pb-20 pt-14 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111] p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Mobile Money Gateway
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight">
          Complete payment
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Review details and secure your purchase through Flutterwave.
        </p>

        <article className="mt-8 space-y-6">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">
            <span className="block text-xs font-semibold uppercase tracking-wider">
              Secure Payment Shield Enabled
            </span>
            <p className="mt-1 text-xs text-emerald-100/70">
              You will be redirected to Flutterwave&apos;s secure checkout page
              to complete your payment.
            </p>
          </div>

          <PaymentSummary checkout={checkout} />

          {errorMsg && (
            <div className="rounded-xl border border-red-900/40 bg-red-900/10 p-4 text-sm text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button
              type="button"
              disabled={isPaying}
              onClick={() => void handlePayment()}
              className="w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white transition duration-200 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {isPaying ? 'REDIRECTING TO PAYMENT...' : 'PAY SECURELY NOW'}
            </button>

            <button
              type="button"
              onClick={() => void navigate({ to: '/cart' })}
              className="block w-full rounded-xl border border-zinc-800 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500 transition duration-200 hover:text-zinc-300"
            >
              Back to Cart
            </button>
          </div>
        </article>
      </section>
    </main>
  )
}

// ── Shared summary component ────────────────────────────────────────

type MoMoCheckout = {
  _id: Id<'checkouts'>
  email: string
  momoNumber: string
  paymentReference: string
  totalAmount: number
  currency?: string
  status: string
  paymentMethod: string
  items?: CheckoutItemSummary[]
  shippingAddress: {
    firstName: string
    lastName: string
    phone: string
    addressLine1: string
    region: string
    city: string
    country: string
  }
}

function PaymentSummary({
  checkout,
  className = '',
}: {
  checkout: MoMoCheckout
  className?: string
}) {
  const customerName =
    `${checkout.shippingAddress.firstName} ${checkout.shippingAddress.lastName}`.trim()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Amount Due Box */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Amount Due
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-emerald-400">
          {checkout.currency || 'GHS'} {checkout.totalAmount.toFixed(2)}
        </p>
      </div>

      {/* Order Items Breakdown */}
      {checkout.items && checkout.items.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Order Items
          </p>
          <div className="space-y-2 text-sm text-zinc-300">
            {checkout.items.map((item, idx) => (
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

      {/* Payment details */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Payment Details
        </p>
        <div className="space-y-2 text-sm text-zinc-300">
          <div className="flex justify-between">
            <span className="text-zinc-500">Reference:</span>
            <span className="font-medium text-white">
              {checkout.paymentReference}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Mobile Money:</span>
            <span className="font-medium text-white">
              {formatPhoneNumber(checkout.momoNumber)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Method:</span>
            <span className="font-medium text-white">
              {checkout.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Email:</span>
            <span className="font-medium text-white">{checkout.email}</span>
          </div>
        </div>
      </div>

      {/* Delivery details */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Shipping Address
        </p>
        <div className="space-y-1 text-sm text-zinc-300">
          <p className="font-semibold text-white">{customerName}</p>
          {checkout.shippingAddress.addressLine1 && (
            <p>{checkout.shippingAddress.addressLine1}</p>
          )}
          <p>
            {checkout.shippingAddress.city}, {checkout.shippingAddress.region}
          </p>
          <p>{checkout.shippingAddress.country}</p>
          {checkout.shippingAddress.phone && (
            <p className="pt-1 text-xs text-zinc-500">
              Phone: {formatPhoneNumber(checkout.shippingAddress.phone)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}