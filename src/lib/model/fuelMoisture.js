import { getMonth } from '$lib/shared/stores/timeStore'
import { simpleNelsonFuelMoisture } from '$lib/model/nelsonFMC/simpleNelson';
import { deadFFMC } from './fireInSiteFFMC';

// slice array and pad with zeros if the slice is
// less than the target length (padLength)
function getPaddedSlice(arr, start, end, padLength) {
  // Get the base slice
  let result;
  if (end === 0) {
    result = [];
  } else if (start < 0) {
    result = [...arr.slice(0, end)];
  } else {
    result = arr.slice(start, end);
  }
  // Pad to reach target length
  if (result.length < padLength) {
    return [...new Array(padLength - result.length).fill(0), ...result];
  }
}

export async function fuelMoistureCalcs(forecast, timeLag, slope, aspect, elevation) {
  console.log("forecast", forecast)

  let nelsonFFMC = null
  const nelsonFFMCs = []
  const fsFFMCs = []
  const ffmcInputs = []
  const ffmcInputTimes = []
  forecast.time.forEach((time, nr) => {
    nelsonFFMC = simpleNelsonFuelMoisture(nelsonFFMC, forecast["temperature2m"][nr], forecast["globalTiltedIrradiance"][nr], forecast["relativeHumidity2m"][nr], forecast["precipitation"][nr])
    nelsonFFMCs.push(nelsonFFMC)
    const inputs = ([...getPaddedSlice(forecast["vapourPressureDeficit"], nr - timeLag, nr + 1, timeLag),
    ...getPaddedSlice(forecast["globalTiltedIrradiance"], nr - timeLag, nr + 1, timeLag),
      slope, aspect, elevation, getMonth(new Date(time)), 1.])
    console.log("inputs", new Date(time), inputs)

    ffmcInputs.push(...inputs)
    ffmcInputTimes.push(time)
  })
  try {
    // First promise
    const resultMoist = await deadFFMC(
      ffmcInputs
    );
    forecast["ffmc"] = resultMoist

  } catch (error) {
    console.error("Error fetching forecast:", error);
    fetchingForecast.set(false);
  }
  forecast["nelsonFFMC"] = nelsonFFMCs
  return forecast

}
