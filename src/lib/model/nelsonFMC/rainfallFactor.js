import { roundToNearest } from './utils'

const rainfallFactors = {
  0.: 4,
  0.25: 8,
  0.5: 15,
  0.75: 19,
  1.: 22,
  1.25: 25,
  1.5: 26,
  1.75: 28,
  2.: 29,
  2.25: 29,
  2.5: 30,
  2.75: 30,
  3.: 30,
  3.25: 30,
  3.5: 31,
}

const rainInd = (rainfall) => rainfall <= 0 ? 0. : rainfall > 3.31 ? 3.5 : roundToNearest(rainfall, 0.25)

export function getRainfallFactor(rainfall) {
  // console.log("rainInd :", rainInd(rainfall))
  return rainfallFactors[rainInd(rainfall)]
}


