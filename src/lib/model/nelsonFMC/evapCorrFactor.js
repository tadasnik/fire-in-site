import { roundToNearest } from './utils.js'
const evaporationCorrectionFactors = {
  30: -2,
  35: -3,
  40: -3,
  45: -3,
  50: -3,
  55: -3,
  60: -4,
  65: -4,
  70: -4,
  75: -4,
  80: -5,
  85: -5,
  90: -6,
  95: -6,
  100: -6,
  105: -7,
  110: -7,
  115: -8,
  120: -8,
  125: -9,
}

const fuelSurfTempEvapInd = (fuelSurfTemp) => fuelSurfTemp <= 30 ? 30 : fuelSurfTemp > 122.5 ? 125 : roundToNearest(fuelSurfTemp, 5)

export function getEvaporationCorrectioneFactor(fuelSurfTemp) {
  return evaporationCorrectionFactors[fuelSurfTempEvapInd(fuelSurfTemp)]
}


