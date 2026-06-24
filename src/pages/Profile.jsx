import { useState } from 'react'
import {
  Bell,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import GradientHeader from '../components/ui/GradientHeader'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useBets } from '../hooks/useBets'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const { bets } = useBets()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)

  const total = bets.length
  const won = bets.filter((b) => b.status === 'won').length
  const decided = bets.filter((b) => b.status === 'won' || b.status === 'forfeited').length
  const winRate = decided ? Math.round((won / decided) * 100) : 0

  const saveName = async () => {
    if (name.trim().length < 2 || !user) return
    setSaving(true)
    await supabase.from('users').update({ name: name.trim() }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setEditing(false)
  }

  const settings = [
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Privacy' },
    { icon: Info, label: 'About' },
  ]

  return (
    <div>
      <GradientHeader title="Profile">
        <div className="mt-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-[24px]">
                {(profile?.name || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-[40px] rounded-inp px-3 text-[16px] text-indigo outline-none w-40"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  disabled={saving}
                  className="w-9 h-9 rounded-full bg-lime text-indigo flex items-center justify-center"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setName(profile?.name || '')
                  }}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[22px] truncate">{profile?.name || 'You'}</h2>
                <button
                  onClick={() => setEditing(true)}
                  aria-label="Edit name"
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0"
                >
                  <Pencil size={15} />
                </button>
              </div>
            )}
            {user?.phone && <p className="text-[13px] text-white/80">{user.phone}</p>}
          </div>
        </div>
      </GradientHeader>

      <div className="px-4 py-5 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total bets" value={total} />
          <Stat label="Bets won" value={won} />
          <Stat label="Win rate" value={`${winRate}%`} />
        </div>

        {/* Settings list */}
        <div className="bg-white rounded-card shadow-card divide-y divide-black/[0.05]">
          {settings.map((s) => (
            <button
              key={s.label}
              className="w-full flex items-center gap-3 p-4 active:bg-black/[0.02]"
            >
              <s.icon size={19} className="text-muted" />
              <span className="flex-1 text-left text-[15px] font-500 text-indigo">{s.label}</span>
              <ChevronRight size={18} className="text-black/20" />
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={signOut}>
          <LogOut size={18} /> Log out
        </Button>

        <p className="text-center text-[12px] text-muted">Bet On You · v1.0</p>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-card shadow-card p-4 text-center">
      <p className="font-mono text-[22px] text-violet">{value}</p>
      <p className="mt-1 text-[12px] text-muted">{label}</p>
    </div>
  )
}
