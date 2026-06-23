import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const SLIDES = [
  {bg:'gradient-hero text-white',art:'🪙',title:'Your goals need skin in the game.',sub:'Set a goal. Bet money on it. Do it or pay up.'},
  {bg:'bg-white text-indigo',steps:[{n:1,icon:'🎯',text:'Set your goal and rules'},{n:2,icon:'💰',text:'Lock in your stake (min ₹100)'},{n:3,icon:'📸',text:'Check in daily with a photo'}],title:'How it works'},
  {bg:'bg-white text-indigo',title:'The stakes',lines:['Win: Get your money back.','Lose: The platform keeps it.','Either way, you showed up.']},
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1
  const slide = SLIDES[i]

  const next = () => {
    if (last) {
      localStorage.setItem('boy_onboarded', '1')
      navigate('/auth')
    } else {
      setI((v) => v + 1)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col ${slide.bg} pt-safe`}>
      <div className="flex justify-end px-5 pt-4">
        {!last && (
          <button
            onClick={() => {
              localStorage.setItem('boy_onboarded', '1')
              navigate('/auth')
            }}
            className={`text-[14px] font-500 ${i === 0 ? 'text-white/80' : 'text-muted'}`}
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center px-7">
        {i === 0 && (
          <div className="text-center">
            <div className="text-[72px] leading-none">{slide.art}💰</div>
            <h1 className="mt-8 font-display text-[26px] leading-tight">{slide.title}</h1>
            <p className="mt-3 text-[16px] text-white/85">{slide.sub}</p>
          </div>
        )}

        {i === 1 && (
          <div>
            <h1 className="font-display text-[24px] leading-tight mb-7">{slide.title}</h1>
            <div className="space-y-4">
              {slide.steps.map((s) => (
                <div key={s.n} className="flex items-center gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-surface flex items-center justify-center text-[22px]">
                    {s.icon}
                  </div>
                  <div>
                    <span className="font-mono text-lime text-[13px] block">STEP {s.n}</span>
                    <span className="text-[16px] font-500">{s.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {i === 2 && (
          <div>
            <h1 className="font-display text-[24px] leading-tight mb-7">{slide.title}</h1>
            <div className="space-y-4">
              {slide.lines.map((line, idx) => (
                <p key={idx} className="text-[18px] font-500 leading-snug">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-7 pb-10 pb-safe">
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === i
                  ? `w-6 ${i === 0 ? 'bg-lime' : 'bg-violet'}`
                  : `w-2 ${i === 0 ? 'bg-white/40' : 'bg-black/15'}`
              }`}
            />
          ))}
        </div>
        <Button variant={i === 0 ? 'lime' : 'violet'} onClick={next}>
          {last ? "Let's go" : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
