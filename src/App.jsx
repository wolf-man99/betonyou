import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import BottomNav from './components/ui/BottomNav'

import Onboarding from './pages/Onboarding'
import Auth from './pages/Auth'
import Home from './pages/Home'
import CreateBet from './pages/CreateBet'
import BetDetail from './pages/BetDetail'
import Bets from './pages/Bets'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'

const ONBOARDING_KEY = 'boy_onboarded'

function FullScreenLoader() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-white text-[40px] tracking-tight">Bet On You</p>
        <span className="mt-4 inline-block w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  )
}

function AppShell() {
  return (
    <div className="min-h-screen bg-surface flex justify-center">
      <div className="w-full max-w-app min-h-screen bg-surface relative flex flex-col">
        <main className="flex-1 overflow-y-auto pb-[72px] no-scrollbar">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

function BareShell() {
  return (
    <div className="min-h-screen bg-surface flex justify-center">
      <div className="w-full max-w-app min-h-screen bg-surface relative flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

// Where should a logged-out visitor land?
function guestHome() {
  const onboarded = localStorage.getItem(ONBOARDING_KEY)
  return onboarded ? '/auth' : '/onboarding'
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoader />

  // ── Guest routes ────────────────────────────────────────────────────────────
  // Logged-out users only ever see onboarding or auth.
  // Every other URL redirects to the right guest landing page.
  if (!user) {
    const dest = guestHome()
    return (
      <Routes>
        <Route element={<BareShell />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
        </Route>
        <Route path="*" element={<Navigate to={dest} replace />} />
      </Routes>
    )
  }

  // ── Authenticated routes ────────────────────────────────────────────────────
  // Logged-in users never see onboarding or auth again.
  return (
    <Routes>
      {/* Bottom-nav shell */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/bets" element={<Bets />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Full-bleed routes (no nav) */}
      <Route element={<BareShell />}>
        <Route path="/create" element={<CreateBet />} />
        <Route path="/bet/:id" element={<BetDetail />} />
      </Route>

      {/* Redirect away from public pages if already logged in */}
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
