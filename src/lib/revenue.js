export const PLATFORM_FEE = 500
export const TAKE_RATE = 0.15
export const MIN_BET = 10000
export const MIN_WITHDRAWAL = 10000

export const creditOnWin = (betAmount) => betAmount

export const platformCut = (betAmount) => Math.floor(betAmount * TAKE_RATE)
export const userLoss = (betAmount) => betAmount - platformCut(betAmount)

export const toRupees = (paise) => `₹${(Math.round(paise) / 100).toLocaleString('en-IN')}`
export const toPaise = (rupees) => Math.round(Number(rupees) * 100)

export const paiseToRupeeNumber = (paise) => Math.round(paise) / 100
