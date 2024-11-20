import { getMonth } from '$lib/shared/stores/timeStore'
import { simpleNelsonFuelMoisture } from '$lib/model/nelsonFMC/simpleNelson';
import { deadFFMC } from './fireInSiteFFMC';


const deadFuelsCategories = { 0: "bracken", 1: "gorse", 2: "heather", 3: "grass" }

function getPaddedSlice(arr, start, end, padLength) {
  // Get the base slice
  // console.log(start, end, padLength)
  let result;
  if (end === 0) {
    result = [];
  } else if (start < 0) {
    result = [...arr.slice(0, end)];
  } else {
    result = arr.slice(start, end);
  }

  // Pad or trim to reach target length
  if (result.length < padLength) {
    return [...new Array(padLength - result.length).fill(0), ...result];
  } else { return result; }
}

export async function fuelMoistureCalcs(forecast, timeLag, slope, aspect, elevation) {
  let nelsonFFMC = null
  const nelsonFFMCs = []
  const fsFFMCs = []
  const ffmcInputs = []
  const deadFuelsCount = Object.keys(deadFuelsCategories).length
  forecast.time.forEach((time, nr) => {
    let gti = forecast["global_tilted_irradiance"][nr] ? forecast["global_tilted_irradiance"][nr] : 0
    nelsonFFMC = simpleNelsonFuelMoisture(nelsonFFMC, forecast["temperature_2m"][nr],
      gti,
      forecast["relative_humidity_2m"][nr],
      forecast["precipitation"][nr])
    nelsonFFMCs.push(nelsonFFMC)
    nr = nr + 1
    const inputs = ([...getPaddedSlice(forecast["vapour_pressure_deficit"], nr - timeLag, nr, timeLag),
    ...getPaddedSlice(forecast["global_tilted_irradiance"], nr - timeLag, nr, timeLag),
      slope, aspect, elevation, getMonth(new Date(time))])
    for (let i = 0; i < deadFuelsCount; i++) {
      let fuelFlagArray = Array(deadFuelsCount).fill(0.)
      fuelFlagArray[i] = 1
      ffmcInputs.push(...inputs, ...fuelFlagArray)
    }
  })
  try {
    // First promise
    const resultMoist = await deadFFMC(
      ffmcInputs
    );
    for (let i = 0; i < deadFuelsCount; i++) {
      let values = []
      let forecastIndex = 0;
      for (let x = i; x < resultMoist.length; x = x + deadFuelsCount) {
        forecastIndex = forecastIndex + 1;
        if ((nelsonFFMCs[forecastIndex] > 30) && (resultMoist[x] < nelsonFFMCs[forecastIndex])) {
          values.push(nelsonFFMCs[forecastIndex]);
        } else {
          values.push(resultMoist[x]);
        }
      }
      forecast["ffmc" + "_" + deadFuelsCategories[i]] = values
    }
  } catch (error) {
    console.error("Error fetching forecast:", error);
    fetchingForecast.set(false);
  }
  forecast["ffmc_nelson"] = nelsonFFMCs
  // console.log("forecast", forecast)
  return forecast

}
