import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth'
import './index.css'

// NOTE: We intentionally do NOT register a service worker right now.
// A previous service worker cached index.html and trapped users on stale
// builds. /sw.js is now a kill-switch that unregisters any existing worker
// and clears its caches. Once an existing worker self-destructs and no new
// one is registered here, every visit loads fresh content from the network.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.update())
  }).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
