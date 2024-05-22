export default async function fetchForecastJSON(latitude, longitude) {
  const response = await
    fetch(`https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly?includeLocationName=true&latitude=${latitude}&longitude=${longitude}`, {
      headers: {
        'accept': 'application/json',
        'apikey': import.meta.env.VITE_METOFFICE_GLOBAL_API_KEY,
      }
    });
  return await response.json();
}

