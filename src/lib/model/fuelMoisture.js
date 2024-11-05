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
  // const ffmcInputTimes = []
  const deadFuelsCount = Object.keys(deadFuelsCategories).length
  // console.log("fuel moisture calc forecast", forecast, timeLag, slope, aspect, elevation)

  forecast.time.forEach((time, nr) => {
    nelsonFFMC = simpleNelsonFuelMoisture(nelsonFFMC, forecast["temperature2m"][nr], forecast["globalTiltedIrradiance"][nr], forecast["relativeHumidity2m"][nr], forecast["precipitation"][nr])
    nelsonFFMCs.push(nelsonFFMC)
    nr = nr + 1
    const inputs = ([...getPaddedSlice(forecast["vapourPressureDeficit"], nr - timeLag, nr, timeLag),
    ...getPaddedSlice(forecast["globalTiltedIrradiance"], nr - timeLag, nr, timeLag),
      slope, aspect, elevation, getMonth(new Date(time))])
    for (let i = 0; i < deadFuelsCount; i++) {
      let fuelFlagArray = Array(deadFuelsCount).fill(0.)
      fuelFlagArray[i] = 1
      ffmcInputs.push(...inputs, ...fuelFlagArray)
    }
    // console.log("inputs", new Date(time), inputs)

    // ffmcInputs.push(...inputs)
    // ffmcInputTimes.push(time)
  })
  // console.log("ffmcInputs", ffmcInputs)
  try {
    // First promise
    // console.log("inputs to ffmc", ffmcInputs)
    const resultMoist = await deadFFMC(
      ffmcInputs
    );
    // console.log("resultMoist", resultMoist)
    for (let i = 0; i < deadFuelsCount; i++) {
      let values = []
      for (let x = i; x < resultMoist.length; x = x + deadFuelsCount) {
        values.push(resultMoist[x]);
      }
      forecast["ffmc" + "_" + deadFuelsCategories[i]] = values
    }

    // const chunkSize = resultMoist.length / deadFuelsCount
    // for (let i = 0; i < resultMoist.length; i += chunkSize) {
    //   console.log("i", i, i + chunkSize)
    //   const chunk = resultMoist.slice(i, i + chunkSize);
    //   console.log("chunk", chunk, chunk.length)
    //   forecast["ffmc" + "_" + deadFuelsCategories[i]] = chunk
    // do whatever
    // }
    // forecast["ffmc"] = resconst chunkSize = resultMoist.length / deadFuelsCount)

  } catch (error) {
    console.error("Error fetching forecast:", error);
    fetchingForecast.set(false);
  }
  forecast["ffmc_nelson"] = nelsonFFMCs
  // console.log("forecast", forecast)
  return forecast

}
