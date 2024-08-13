import { writable, derived, get } from 'svelte/store'
import { currentLocation } from '$lib/shared/stores/locationStore'
import { dateTime, differenceHours } from '$lib/shared/stores/timeStore'
import fetchForecastJSON from "$lib/weather/metoffice";
import { fetchForecastMeteo, fetchHistoryMeteo } from "$lib/weather/openMeteo.ts";

export const forecastOpenMeteo = writable({
  time: [1403984000],
  temperature2m: [15.05],
  relativeHumidity2m: [78.61],
  precipitation: [0],
  weatherCode: [3],
  cloudCover: [75],
  windSpeed10m: [3.12],
  windDirection10m: [150],
  windGusts10m: [5.05],
  globalTiltedIrradiance: [0],
})

export const forecastTimeSeries = writable([{
  feelsLikeTemperature: 15.05,
  max10mWindGust: 5.05,
  maxScreenAirTemp: 15.94,
  minScreenAirTemp: 15.66,
  mslp: 102390,
  precipitationRate: 0,
  probOfPrecipitation: 1,
  screenDewPointTemperature: 12.26,
  screenRelativeHumidity: 78.61,
  screenTemperature: 15.93,
  significantWeatherCode: 3,
  time: "2024-06-03T09:00Z",
  totalPrecipAmount: 0,
  totalSnowAmount: 0,
  uvIndex: 4,
  visibility: 19389,
  windDirectionFrom10m: 330,
  windGustSpeed10m: 5.05,
  windSpeed10m: 3.12
}])

export const forecastLocation = writable({ coordinates: [-3, 53, 100], name: "" })


export function getForecastOpenMeteo() {
  if ((get(currentLocation).latitude) && (get(currentLocation).userLocation) && (get(currentLocation).distanceFromPrevious > 5000)) {
    console.log("fetching forecast openMeteo")
    var promise = fetchForecastMeteo(
      get(currentLocation).latitude,
      get(currentLocation).longitude,
      get(currentLocation).slope,
      get(currentLocation).aspect
    );
    promise.then(function (result) {
      console.log("setting OpenMeteo result", result)
      forecastOpenMeteo.set(result)
    })
  }
}
export function getForecast() {
  // console.log("checking forecast conditions, currentLocation : ", get(currentLocation))
  if ((get(currentLocation).latitude) && (get(currentLocation).userLocation) && (get(currentLocation).distanceFromPrevious > 5000)) {
    console.log("fetching forecast")
    var promise = fetchForecastJSON(
      get(currentLocation).latitude,
      get(currentLocation).longitude,
    );
    promise.then(function (result) {
      // console.log('!!!!!!!!!!!!!!!!!!!!!!!!setting currentWeather', result)
      // const indexCurrent = differenceHours(new Date(get(dateTime)), new Date(result.features[0].properties.timeSeries[0].time))
      // currentWeather.set(result.features[0].properties.timeSeries[indexCurrent])

      console.log("setting forecast location")
      forecastLocation.set({ coordinates: result.features[0].geometry.coordinates, name: result.features[0].properties.location.name })
      console.log("setting forecast timeSerie")
      forecastTimeSeries.set(result.features[0].properties.timeSeries)
      // console.log('!!!!!!!!!!!!!!!!!!!!!!!!setting currentWeather, done')
    })
  }
}

export const forecastTimeIndex = derived(forecastTimeSeries, ($forecastTimeSeries) => {
  let indexMap = new Map()
  for (const [i, value] of $forecastTimeSeries.entries()) {
    indexMap.set(3600000 * (Math.round(new Date(value.time) / 3600000)), value)
  }
  return indexMap
})

export const currentWeather = derived([forecastTimeSeries, dateTime], ([$forecastTimeSeries, $dateTime]) => {
  let currForecast = {}
  const indexCurrent = differenceHours(new Date($dateTime), new Date($forecastTimeSeries[0].time))
  if (indexCurrent < 5) {
    currForecast = $forecastTimeSeries[indexCurrent]
  } else {
    currForecast = $forecastTimeSeries[0]
  }
  return currForecast
});


export const elevationDiff = derived([forecastLocation, currentLocation], ([$forecastLocation, $currentLocation]) => {
  return $forecastLocation.coordinates[2] - $currentLocation.elevation
})

export const currentTimeIndex = derived([forecastOpenMeteo, dateTime], ([$forecastOpenMeteo, $dateTime]) => {
  return $forecastOpenMeteo['time'].indexOf($dateTime)
})
// export const currentTimeIndex = derived([forecastTimeIndex, dateTime], ([$forecastTimeIndex, $dateTime]) => {
//   return Array.from($forecastTimeIndex.keys()).indexOf($dateTime)
// })


// export const currentWeather = derived([currentWeatherInit, locations, dateTime], ([$currentWeatherInit, $locations, $dateTime]) => {
//   if ($locations.currentLocation.latitude) {
//     console.log('!!!!!!!!!!!!!!!!!!!!!!!!calling fetchForecastJSON with location : ', $locations['currentLocation'])
//     var promise = fetchForecastJSON(
//       $locations['currentLocation'].latitude,
//       $locations['currentLocation'].longitude,
//     );
//     promise.then(function(result) {
//       console.log('!!!!!!!!!!!!!!!!!!!!!!!!setting currentW')
//       const indexCurrent = differenceHours(new Date($dateTime), new Date(result.features[0].properties.timeSeries[0].time))
//       $currentWeatherInit = result.features[0].properties.timeSeries[indexCurrent]
//       forecastLocation = { coordinates: result.features[0].geometry.coordinates, name: result.features[0].properties.location.name }
//       console.log('!!!!!!!!!!!!!!!!!!!!!!!!setting currentW, done :  ', currentW)
//     })
//   }
//   return currentW
// })
//
// const forecast = derived([forecastInit, locations, dateTime], ([$forecastInit, $locations, $dateTime]) => {
//   let forecastObject = {}
//   if ($locations.currentLocation.latitude) {
//     console.log('!!!!!!!!!!!!!!!!!!!!!!!!calling fetchForecastJSON with location : ', $locations['currentLocation'])
//     var promise = fetchForecastJSON(
//       $locations['currentLocation'].latitude,
//       $locations['currentLocation'].longitude,
//     );
//     promise.then(function(result) {
//       console.log('!!!!!!!!!!!!!!!!!!!!!!!!setting forecastObject')
//       forecastObject.timeSeries = result.features[0].properties.timeSeries
//       const indexCurrent = differenceHours(new Date($dateTime), new Date(forecastObject.timeSeries[0].time))
//       forecastObject.currentWeather = result.features[0].properties.timeSeries[indexCurrent]
//       forecastObject.location = { coordinates: result.features[0].geometry.coordinates, name: result.features[0].properties.location.name }
//       forecastObject = forecastObject
//       console.log('!!!!!!!!!!!!!!!!!!!!!!!!setting forecastObject, done :  ', forecastObject)
//     })
//   }
//   return forecastObject
//
// })
// export const forecast = writable({})
// export async function fetchForecast() {
//   locations.subscribe((value) => {
//     console.log('value ', value)
//     if (value.currentLocation.latitude) {
//       var promise = fetchForecastJSON(
//         value['currentLocation'].latitude,
//         value['currentLocation'].longitude,
//       );
//       promise.then(function(result) {
//         forecast.timeSeries = result.features[0].properties.timeSeries
//         const indexCurrent = differenceHours(get(dateTime), new Date(forecast.timeSeries[0].time))
//         forecast.currentWeather = result.features[0].properties.timeSeries[indexCurrent]
//         forecast.location = { coordinates: result.features[0].geometry.coordinates, name: result.features[0].properties.location.name }



//     })
//   }
// });
// });
// }

