import { writable, get } from 'svelte/store'
import { locations } from '$lib/shared/stores/locationStore'
import { dateTime, differenceHours } from '$lib/shared/stores/timeStore'
import fetchForecastJSON from "$lib/weather/metoffice";

export const currentWeather = writable({
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
})

export const forecastLocation = writable({ coordinates: [], name: "" })
export const forecastTimeSeries = writable([])

export function getForecast() {
  console.log(get(locations).currentLocation)
  if (get(locations).currentLocation.latitude) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!calling fetchForecastJSON with location : ', get(locations).currentLocation)
    var promise = fetchForecastJSON(
      get(locations).currentLocation.latitude,
      get(locations).currentLocation.longitude,
    );
    promise.then(function(result) {
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!setting currentW')
      const indexCurrent = differenceHours(new Date(get(dateTime)), new Date(result.features[0].properties.timeSeries[0].time))
      currentWeather.set(result.features[0].properties.timeSeries[indexCurrent])
      forecastLocation.set({ coordinates: result.features[0].geometry.coordinates, name: result.features[0].properties.location.name })
      forecastTimeSeries.set(result.features[0].properties.timeSeries)
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!setting currentWeather, done')
    })
  }
}

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

