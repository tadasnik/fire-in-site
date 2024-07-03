import { getFuelSurfTemp } from './fuelSurfTemp.js';
import { getEqMoistContent } from './eqMoistContent.js';
import { getEvaporationCorrectioneFactor } from './evapCorrFactor.js';
import { getRainfallFactor } from './rainfallFactor.js';
import { getMoistureCorrectionFactor } from './moistCorrFactor.js';


export function simpleNelsonFuelMoisture(prevMoist, temp, solRad, relHum, rainfall) {
  let initMoisture = null;
  let rMF = 0;
  let eCF = 0;
  let mCF = 0;
  console.log("nelsol params : prevMoist, temp, solRad, relHum, rainfall :", prevMoist, temp, solRad, relHum, rainfall)
  const fuelTemp = getFuelSurfTemp(temp, solRad)
  console.log("fuelTemp: ", fuelTemp)
  const eqMoistContent = getEqMoistContent(fuelTemp, relHum)
  console.log("eq moisture: ", eqMoistContent)
  if (!prevMoist) {
    initMoisture = eqMoistContent
  } else {
    initMoisture = prevMoist
  }
  if (rainfall > 0) {
    rMF = getRainfallFactor(rainfall)
    console.log("rainfall recorded, rmF: ", rMF)
  } else if (initMoisture > 30) {
    eCF = getEvaporationCorrectioneFactor(fuelTemp)
    console.log("evaporation recorded, eCM: ", eCF)
  } else {
    mCF = getMoistureCorrectionFactor(initMoisture, eqMoistContent, fuelTemp, relHum)
    console.log("moisture correction recorded, mCF: ", mCF)
  }
  const newFMC = initMoisture + rMF + eCF + mCF
  console.log("newFMC =  ", newFMC, " = ", initMoisture, " + ", rMF, " + ", eCF, " + ", mCF)
  return newFMC > 60 ? 60 : newFMC
}
