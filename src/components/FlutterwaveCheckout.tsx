import { useEffect, useState } from 'react'

declare global {
  interface Window {
    FlutterwaveCheckout: any
  }
}

interface FlutterwaveCheckoutProps {
  config: {
    reference: string
    email: string
    amount: number
    publicKey: string
    currency: string
    customerName: string
    phoneNumber: string
    orderItemsBreakdown: string
    checkoutId: string
  } | null
  onSuccess: (response: { transaction_id: string; tx_ref: string }) => void
  onClose: () => void
  isPaying: boolean
  isPaid: boolean
  onInitiate: () => void
}

export default function FlutterwaveCheckout({
  config,
  onSuccess,
  onClose,
  isPaying,
  isPaid,
  onInitiate,
}: FlutterwaveCheckoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Dynamically load the Flutterwave script and manage hydration-safe event listeners
  useEffect(() => {
    setIsMounted(true)

    if (typeof window === 'undefined') return

    // Track any window 'message' event listeners added while this component is mounted
    // to cleanly dispose of them and prevent MaxListenersExceededWarning memory leaks
    const messageListeners: Array<(ev: MessageEvent) => any> = []
    const originalAddEventListener = window.addEventListener

    window.addEventListener = function (
      type: string,
      listener: any,
      options?: any,
    ) {
      if (type === 'message') {
        messageListeners.push(listener)
      }
      return originalAddEventListener.call(this, type, listener, options)
    }

    if (window.FlutterwaveCheckout) {
      setScriptLoaded(true)
    } else {
      const script = document.createElement('script')
      script.src = 'https://checkout.flutterwave.com/v3.js'
      script.async = true
      script.onload = () => setScriptLoaded(true)
      document.body.appendChild(script)
    }

    return () => {
      // Restore the original addEventListener method
      window.addEventListener = originalAddEventListener

      // Clean up all captured message event listeners to prevent memory leaks
      messageListeners.forEach((listener) => {
        window.removeEventListener('message', listener)
      })

      // Clean up the script from the DOM
      const script = document.querySelector(
        'script[src="https://checkout.flutterwave.com/v3.js"]',
      )
      if (script && document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Static placeholder button matching the server-rendered skeleton perfectly
  if (!isMounted || !config) {
    return (
      <button
        type="button"
        disabled
        className="cta-primary w-full justify-center py-4 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Pay with Mobile Money / Card
      </button>
    )
  }

  const handlePay = () => {
    if (!scriptLoaded || !window.FlutterwaveCheckout) {
      alert('Flutterwave SDK is loading, please try again in a moment.')
      return
    }

    onInitiate()

    window.FlutterwaveCheckout({
      public_key: config.publicKey,
      tx_ref: config.reference,
      amount: config.amount,
      currency: config.currency,
      payment_options: 'card,mobilemoneyghana',
      customer: {
        email: config.email,
        phone_number: config.phoneNumber,
        name: config.customerName,
      },
      meta: {
        checkout_id: config.checkoutId,
        order_items: config.orderItemsBreakdown,
      },
      customizations: {
        title: 'Bra Music Portal',
        description: 'Merchandise Payment',
        logo: 'https://checkout.flutterwave.com/assets/img/flutterwave-badge.svg',
      },
      callback: (data: any) => {
        onSuccess({
          transaction_id: String(data.transaction_id || data.id),
          tx_ref: String(data.tx_ref),
        })
      },
      onclose: () => {
        onClose()
      },
    })
  }

  return (
    <button
      type="button"
      disabled={!scriptLoaded || isPaying || isPaid}
      onClick={handlePay}
      className="cta-primary w-full justify-center py-4 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {!scriptLoaded
        ? 'Loading payment gateway…'
        : isPaying
          ? 'Processing…'
          : isPaid
            ? 'Already paid'
            : 'Pay with Mobile Money / Card'}
    </button>
  )
}
