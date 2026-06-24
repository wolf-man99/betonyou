// Razorpay checkout helpers.
//
// In a production build the `order_id` should come from a server/Edge Function
// that calls Razorpay's Orders API with your secret key. For the Phase 1 MVP we
// support both: if `orderId` is provided we use it, otherwise Razorpay falls
// back to a keyed test charge so the flow is demoable end-to-end.

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

export const isRazorpayConfigured = Boolean(RAZORPAY_KEY_ID)

export const openRazorpay = ({ amount, orderId, name, phone, email, onSuccess, onFailure }) => {
  if (typeof window === 'undefined' || !window.Razorpay) {
    onFailure?.('Razorpay SDK not loaded')
    return
  }

  if (!RAZORPAY_KEY_ID) {
    onFailure?.('Razorpay key not configured')
    return
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount, // in paise
    currency: 'INR',
    name: 'Bet On You',
    description: 'Goal stake',
    image: '/icons/icon-192.svg',
    order_id: orderId || undefined,
    prefill: { name, contact: phone, email },
    theme: { color: '#7C3AED' },
    handler: (response) => onSuccess?.(response),
    modal: { ondismiss: () => onFailure?.('dismissed') },
  }

  try {
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp) => onFailure?.(resp?.error?.description || 'payment_failed'))
    rzp.open()
  } catch (err) {
    onFailure?.(err?.message || 'razorpay_error')
  }
}
