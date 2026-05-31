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
  }
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
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Dynamically load the Flutterwave script in a lag-free manner
  useEffect(() => {
    if (window.FlutterwaveCheckout) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.flutterwave.com/v3.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      // Keep script in body to avoid reloading on remounts
    }
  }, [])

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
        // Successful payment callback
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
