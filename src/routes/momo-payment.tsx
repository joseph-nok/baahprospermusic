import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
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

function formatOrderItemsBreakdown(items: CheckoutItemSummary[] = []) {
  if (!items.length) return 'N/A'
  return items
    .map((item) => {
      const productName = item.productName.trim() || 'Merch'
      return `${item.quantity}x ${productName} - Color: ${item.color.trim()}, Size: ${item.size.trim()}`
    })
    .join('\n')
}

function MoMoPaymentPage() {
  const navigate = useNavigate()
  const convexApi = api as any
  const { checkoutId } = Route.useSearch()

  const checkout = useQuery(
    convexApi.commerce.getCheckout,
    checkoutId ? { checkoutId: checkoutId as Id<'checkouts'> } : 'skip',
  )
  const verifyPayment = useAction(convexApi.commerce.verifyFlutterwavePayment)

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

  if (checkout === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <article className="p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
          <p className="mt-6 text-xl font-bold text-white">Loading payment...</p>
        </article>
      </main>
    )
  }

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

  return (
    <MoMoPaymentCheckout
      checkout={checkout}
      verifyPayment={verifyPayment}
      navigate={navigate}
    />
  )
}

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

function MoMoPaymentCheckout({
  checkout,
  verifyPayment,
  navigate,
}: {
  checkout: MoMoCheckout
  verifyPayment: (args: {
    transactionId: string
    checkoutId: Id<'checkouts'>
  }) => Promise<unknown>
  navigate: ReturnType<typeof useNavigate>
}) {
  const [paymentStep, setPaymentStep] = useState<'review' | 'success'>('review')
  const [isPaying, setIsPaying] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if ((window as any).FlutterwaveCheckout) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.flutterwave.com/v3.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleLivePaymentLaunch = () => {
    if (!scriptLoaded || !(window as any).FlutterwaveCheckout) {
      alert('Payment gateway is loading. Please wait a moment and try again.')
      return
    }

    setIsPaying(true)

    const customerName = `${checkout.shippingAddress.firstName} ${checkout.shippingAddress.lastName}`.trim()
    const orderItemsBreakdown = formatOrderItemsBreakdown(checkout.items)
    const phoneNumber = checkout.shippingAddress.phone || checkout.momoNumber
    const uniqueTxRef = `${checkout._id}_${Date.now()}`

      ; (window as any).FlutterwaveCheckout({
        public_key: import.meta.env.VITE_FLW_PUBLIC_KEY || '',
        tx_ref: uniqueTxRef,
        amount: checkout.totalAmount || 0,
        currency: checkout.currency || 'GHS',
        payment_options: 'mobilemoneygh, card',
        customer: {
          email: checkout.email || '',
          phone_number: phoneNumber,
          name: customerName,
        },
        meta: {
          order_items: orderItemsBreakdown,
          checkoutId: checkout._id,
        },
        customizations: {
          title: 'Baah Prosper Music',
          description: 'Secure Payment for Digital Merch Order',
        },
        callback: async (data: { transaction_id: string; tx_ref: string }) => {
          try {
            await verifyPayment({
              transactionId: data.transaction_id.toString(),
              checkoutId: checkout._id,
            })
            setPaymentStep('success')
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact business support.')
          } finally {
            setIsPaying(false)
          }
        },
        onclose: () => {
          setIsPaying(false)
        },
      })
  }

  if (paymentStep === 'success') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 pb-20 pt-14 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Success
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Payment complete
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Your transaction has processed successfully.
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
              Your payment information remains completely encrypted and is verified instantly.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm">
            <div className="flex items-center justify-between text-gray-400">
              <span>Amount to Pay:</span>
              <span className="font-bold text-white">
                {checkout.currency || 'GHS'} {checkout.totalAmount}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Account Email:</span>
              <span className="text-white">{checkout.email}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="button"
              disabled={isPaying || !scriptLoaded}
              onClick={handleLivePaymentLaunch}
              className="w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white transition duration-200 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {isPaying
                ? 'PROCESSING TRANSACTION...'
                : scriptLoaded
                  ? 'PAY SECURELY NOW'
                  : 'LOADING GATEWAY...'}
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