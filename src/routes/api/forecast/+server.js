import { proxyOpenMeteo } from '$lib/server/openMeteoProxy.js';

const CUSTOMER = 'https://customer-api.open-meteo.com/v1/forecast';
const FREE = 'https://api.open-meteo.com/v1/forecast';

// Forecast proxy — keeps the paid apikey server-side. See openMeteoProxy.js.
export function GET(event) {
  return proxyOpenMeteo(event, CUSTOMER, FREE);
}
