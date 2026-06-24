// Small date helpers (no external dependency).

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const daysBetween = (a, b) => {
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

// Days remaining until end_date (>= 0). Past dates clamp to 0.
export const daysRemaining = (endDate) => Math.max(0, daysBetween(todayISO(), endDate))

export const isPast = (dateStr) => daysBetween(todayISO(), dateStr) < 0

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
