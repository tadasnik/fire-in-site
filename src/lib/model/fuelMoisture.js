import { simpleNelsonFuelMoisture } from '$lib/model/nelsonFMC/simpleNelson';
import { deadFFMC } from './fireInSiteFFMC';
import { daylightSeconds } from '$lib/model/grassCuring';

const DAY_MS = 86400000;


// Order MUST match the model one-hot in export_dead_ddur.py:
// Bracken, Gorse, Heather, Moor(=grass), Litter.
const deadFuelsCategories = { 0: "bracken", 1: "gorse", 2: "heather", 3: "grass", 4: "litter" }

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

export async function fuelMoistureCalcs(forecast, timeLag, latitude) {
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
    // Seasonal predictors: astronomical daylength (ddur, seconds) and its
    // day-to-day change (yesterday - today). Computed from latitude+date (no
    // fetch); smooth, higher-skill, hemisphere-correct. Terrain (slope/aspect/
    // elevation) is intentionally NOT an input — GTI is already tilt/azimuth-
    // adjusted so it carries that signal. Must match export_dead_ddur.py order.
    const ddur = daylightSeconds(latitude, new Date(time));
    const ddurChange = daylightSeconds(latitude, new Date(time - DAY_MS)) - ddur;
    const inputs = ([...getPaddedSlice(forecast["vapour_pressure_deficit"], nr - timeLag, nr, timeLag),
    ...getPaddedSlice(forecast["global_tilted_irradiance"], nr - timeLag, nr, timeLag),
      ddur, ddurChange])
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
        // Floor dead FMC at 1% — 0% is physically implausible and can cause
        // extreme/degenerate behaviour downstream.
        if (resultMoist[x] < 1) {
          resultMoist[x] = 1
        }
        if ((nelsonFFMCs[forecastIndex] > 30) && (resultMoist[x] < nelsonFFMCs[forecastIndex])) {
          values.push(nelsonFFMCs[forecastIndex]);
        } else {
          values.push(resultMoist[x]);
        }
      }
      forecast["ffmc" + "_" + deadFuelsCategories[i]] = values
    }
  } catch (error) {
    console.error("Error in deadFFMC ONNX inference:", error);
  }
  forecast["ffmc_nelson"] = nelsonFFMCs
  // console.log("forecast", forecast)
  return forecast

}
