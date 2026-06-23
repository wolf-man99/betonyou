import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import Button from '../components/ui/Button'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const STEPS = { PHONE: 'phone', OTP: 'otp', NAME: 'name' }

export default function Auth() {
  const navigate = useNavigate()
  const { createProfile } = useAuth()
  const [step, setStep] = useState(STEPS.PHONE)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const otpRefs = useRef([])

  const sendOtp = async () => {
    setError('')
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    if (!isSupabaseConfigured) {
      setError('Supabase not configured. Add your keys to .env.local to enable login.')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setStep(STEPS.OTP)
    setTimeout(() => otpRefs.current[0]?.focus(), 50)
  }

  const onOtpChange = (idx, val) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const onOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }

  const verifyOtp = async () => {
    setError('')
    const token = otp.join('')
    if (token.length !== 6) {
      setError('Enter the 6-digit code')
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: 'sms',
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle()
    if (existing) {
      navigate('/', { replace: true })
    } else {
      setStep(STEPS.NAME)
    }
  }

  const saveName = async () => {
    setError('')
    if (name.trim().length < 2) {
      setError('Tell us your name')
      return
    }
    setLoading(true)
    const { error: err } = await createProfile(name.trim())
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="gradient-hero text-white pt-safe">
        <div className="px-6 pt-10 pb-12">
          <p className="font-display text-[40px] tracking-tight">BOY</p>
          <p className="mt-1 text-[15px] text-white/85">Bet On You</p>
        </div>
      </header>

      <div className="flex-1 px-6 -mt-6">
        <div className="bg-white rounded-card shadow-card p-5">
          {step === STEPS.PHONE && (
            <>
              <h2 className="font-700 text-[18px] text-indigo">Enter your mobile number</h2>
              <p className="mt-1 text-[13px] text-muted">We'll text you a one-time code.</p>
              <div className="mt-4 flex items-center gap-2 rounded-inp border border-black/10 px-3 min-h-[52px] focus-within:border-violet focus-within:ring-2 focus-within:ring-violet/20">
                <Phone size={18} className="text-muted" />
                <span className="text-[16px] text-indigo font-500">+91</span>
                <input
                  inputMode="numeric"
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="flex-1 text-[16px] outline-none bg-transparent"
                />
              </div>
              {error && <p className="mt-2 text-[13px] text-coral">{error}</p>}
              <div className="mt-5">
                <Button onClick={sendOtp} loading={loading}>
                  Send OTP
                </Button>
              </div>
            </>
          )}

          {step === STEPS.OTP && (
            <>
              <h2 className="font-700 text-[18px] text-indigo">Enter the code</h2>
              <p className="mt-1 text-[13px] text-muted">Sent to +91 {phone}</p>
              <div className="mt-4 flex gap-2 justify-between">
                {otp.map((d, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    inputMode="numeric"
                    value={d}
                    onChange={(e) => onOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => onOtpKey(idx, e)}
                    className="w-12 h-14 text-center text-[20px] font-700 rounded-inp border border-black/10 outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
                  />
                ))}
              </div>
              {error && <p className="mt-2 text-[13px] text-coral">{error}</p>}
              <div className="mt-5">
                <Button onClick={verifyOtp} loading={loading}>
                  Verify
                </Button>
              </div>
              <button
                onClick={() => {
                  setStep(STEPS.PHONE)
                  setOtp(['', '', '', '', '', ''])
                }}
                className="mt-3 w-full text-[13px] text-muted"
              >
                Change number
              </button>
            </>
          )}

          {step === STEPS.NAME && (
            <>
              <h2 className="font-700 text-[18px] text-indigo">What should we call you?</h2>
              <p className="mt-1 text-[13px] text-muted">This shows on your profile.</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-4 w-full min-h-[52px] rounded-inp border border-black/10 px-4 text-[16px] outline-none focus:border-violet focus:ring-2 focus:ring-violet/20"
              />
              {error && <p className="mt-2 text-[13px] text-coral">{error}</p>}
              <div className="mt-5">
                <Button onClick={saveName} loading={loading}>
                  Continue
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 px-2 text-center text-[12px] text-muted leading-relaxed">
          By continuing you agree to put real money on your goals. Win it back or forfeit it.
        </p>
      </div>
    </div>
  )
}
