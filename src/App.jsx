import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
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
        <p className="font-display text-white text-[40px] tracking-tight">BOY</p>
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

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />
  return children
}

export default function App() {
  const { user, loading } = useAuth()
  const onboarded = typeof localStorage !== 'undefined' && localStorage.getItem(ONBOARDING_KEY)
  if (loading) return <FullScreenLoader />

  return (
    <Routes>
      <Route element={<BareShell />}>
        <Route path="/onboarding" element={user ? <Navigate to="/" replace /> : <Onboarding />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/create" element={<RequireAuth><CreateBet /></RequireAuth>} />
        <Route path="/bet/:id" element={<RequireAuth><BetDetail /></RequireAuth>} />
      </Route>
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/" element={<Home />} />
        <Route path="/bets" element={<Bets />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : onboarded ? '/auth' : '/onboarding'} replace />} />
    </Routes>
  )
}
