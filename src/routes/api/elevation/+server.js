import { proxyOpenMeteo } from '$lib/server/openMeteoProxy.js';

const CUSTOMER = 'https://customer-api.open-meteo.com/v1/elevation';
const FREE = 'https://api.open-meteo.com/v1/elevation';

// Elevation proxy — used for point elevation + slope/aspect sampling on every
// location change. Routed through the paid subscription so the free quota is
// preserved for archive/historical calls. See openMeteoProxy.js.
export function GET(event) {
  return proxyOpenMeteo(event, CUSTOMER, FREE);
}
