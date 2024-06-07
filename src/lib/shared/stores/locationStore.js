import { writable } from 'svelte/store'

export const locations = writable({ 'currentLocation': { 'latitude': null, 'longitude': null } })

export async function getLocation() {
  try {
    // 5. Dispatch the request for the users
    const response = await fetch("https://ipinfo.io/json?token=c0de8aff3465a1")
    if (response.ok) {
      const jsonResponse = await response.json()
      console.log(jsonResponse, locations)
      locations.update(current => ({ ...current, currentLocation: { 'latitude': jsonResponse.loc.split(',')[0], 'longitude': jsonResponse.loc.split(',')[1] } }))
    }
    else {
      const text = response.text();
      throw new Error(text);
    }
  } catch (error) {

    throw new Error(error);
  }
  return
}
// var promise1 = new Promise(function(resolve, reject) {
//   navigator.geolocation.getCurrentPosition(function(pos) {
//     locations['currentLocation'].latitude = pos.coords.latitude;
//     locations['currentLocation'].longitude = pos.coords.longitude;
//     resolve(pos);
//   }, errorCallback);
// });
// promise1.then(function() {
//   var promise2 = fetchForecastJSON(
//     coordinates.latitude,
//     coordinates.longitude
//   );
//   promise2.then(function(result) {
//     forecast.timeSeries = result.features[0].properties.timeSeries
//     console.log('result in store : ', result)
//     console.log('forecast in store : ', forecast.timeSeries[0].time)
//
//   });
// });
