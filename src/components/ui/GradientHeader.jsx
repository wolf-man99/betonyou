import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function GradientHeader({ title, subtitle, back = false, right, children }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 gradient-hero text-white pt-safe">
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2 min-h-[28px]">
          <div className="flex items-center gap-2 min-w-0">
            {back && (
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="-ml-1 w-9 h-9 flex items-center justify-center rounded-full active:bg-white/15 shrink-0"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {title && (
              <h1 className="font-display text-[20px] leading-tight truncate">{title}</h1>
            )}
          </div>
          {right}
        </div>
        {subtitle && <p className="mt-1 text-[13px] text-white/80">{subtitle}</p>}
        {children}
      </div>
    </header>
  )
}
