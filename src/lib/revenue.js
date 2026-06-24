// Revenue + money formatting helpers. All amounts stored in paise (₹1 = 100 paise).

export const PLATFORM_FEE = 500 // ₹5 in paise
export const TAKE_RATE = 0.15 // 15% of forfeited amount
export const MIN_BET = 10000 // ₹100 in paise
export const MIN_WITHDRAWAL = 10000 // ₹100 in paise

// On bet win — full stake returned as BOY points.
export const creditOnWin = (betAmount) => betAmount

// On bet forfeit.
export const platformCut = (betAmount) => Math.floor(betAmount * TAKE_RATE)
export const userLoss = (betAmount) => betAmount - platformCut(betAmount)

// Display helpers.
export const toRupees = (paise) => `₹${(Math.round(paise) / 100).toLocaleString('en-IN')}`
export const toPaise = (rupees) => Math.round(Number(rupees) * 100)

// Format a plain rupee number (no symbol) for inputs / large displays.
export const paiseToRupeeNumber = (paise) => Math.round(paise) / 100
