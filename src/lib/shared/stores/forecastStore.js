import { writable, derived } from 'svelte/store'
import fetchForecastJSON from "$lib/weather/metoffice";
export const coordinates = writable({ 'latitude': 51.6, 'longitude': -4 })
export const forecast = writable({})
export async function fetchForecast(forecast, coordinates) {
  const errorCallback = (error) => {
    console.log("there was ", error);
  };
  var promise1 = new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      coordinates.latitude = pos.coords.latitude;
      coordinates.longitude = pos.coords.longitude;
      resolve(pos);
    }, errorCallback);
  });
  promise1.then(function() {
    var promise2 = fetchForecastJSON(
      coordinates.latitude,
      coordinates.longitude
    );
    promise2.then(function(result) {
      forecast.timeSeries = result.features[0].properties.timeSeries
      console.log('result in store : ', result)
      console.log('forecast in store : ', forecast.timeSeries[0].time)

    });
  });
}

