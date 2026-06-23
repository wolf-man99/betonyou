import { useRef, useState } from 'react'
import exifr from 'exifr'
import { X, Camera, MapPin, AlertTriangle, Check } from 'lucide-react'
import Button from './ui/Button'
import { submitCheckin } from '../lib/betActions'
import { useAuth } from '../hooks/useAuth'

const extractGPS = async (file) => {
  try {
    const gps = await exifr.gps(file)
    return gps ? { lat: gps.latitude, lng: gps.longitude } : null
  } catch {
    return null
  }
}

export default function CheckInModal({ bet, onClose, onDone }) {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [gps, setGps] = useState(null)
  const [gpsChecked, setGpsChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onPick = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setGpsChecked(false)
    const coords = await extractGPS(f)
    setGps(coords)
    setGpsChecked(true)
  }

  const submit = async () => {
    if (!file || !bet || !user) return
    setSubmitting(true)
    setError('')
    const res = await submitCheckin({ bet, userId: user.id, file, gps })
    setSubmitting(false)
    if (res.error) {
      setError(res.error.message || 'Could not submit check-in. Try again.')
      return
    }
    onDone?.(res)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-app bg-white rounded-t-[24px] p-5 pb-safe animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-muted">Check in for</p>
            <h2 className="font-700 text-[16px] text-indigo leading-snug pr-6 line-clamp-2">
              {bet?.description}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 -mr-1 flex items-center justify-center rounded-full active:bg-black/5"
          >
            <X size={22} />
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />

        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 w-full aspect-[4/3] rounded-card border-2 border-dashed border-black/15 bg-surface
              flex flex-col items-center justify-center gap-2 text-muted active:bg-black/[0.03]"
          >
            <Camera size={36} className="text-violet" />
            <span className="text-[14px] font-500">Tap to take photo</span>
          </button>
        ) : (
          <div className="mt-4">
            <div className="relative rounded-card overflow-hidden">
              <img src={preview} alt="Check-in" className="w-full aspect-[4/3] object-cover" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-[12px] font-500"
              >
                Retake
              </button>
            </div>

            {gpsChecked && (
              <div className="mt-3 flex items-center gap-2 text-[13px] font-500">
                {gps ? (
                  <span className="flex items-center gap-1.5 text-[#5a9b00]">
                    <MapPin size={16} /> Location detected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber">
                    <AlertTriangle size={16} /> No location data
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-[13px] text-coral">{error}</p>}

        <div className="mt-5">
          <Button onClick={submit} disabled={!file} loading={submitting}>
            <Check size={18} /> Submit check-in
          </Button>
        </div>
      </div>
    </div>
  )
}
