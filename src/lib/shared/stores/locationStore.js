import { writable } from 'svelte/store'

export const currentLocation = writable({ 'userLocation': false, distanceFromPrevious: null, 'latitude': 53, 'longitude': 0, 'elevation': 0, 'slope': 0, 'aspect': 0 })

export async function getLocation() {
  try {
    // 5. Dispatch the request for the users
    var requestOptions = {
      method: "GET",
    };

    const response = await fetch(
      "https://api.geoapify.com/v1/ipinfo?apiKey=a9a12ccc820342c78776d16e77cb83fb",
      requestOptions,
    )
    if (response.ok) {
      const jsonResponse = await response.json()
      return [parseFloat(jsonResponse.location.latitude), parseFloat(jsonResponse.location.longitude)]
    }
    else {
      const text = response.text();
    }
  } catch (error) {
    throw new Error(error);

  }
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
