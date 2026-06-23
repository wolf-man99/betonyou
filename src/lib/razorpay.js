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
    amount,
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
