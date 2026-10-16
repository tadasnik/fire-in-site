# FireInSite

A fire behaviour prediction and visualization tool. Visit (https://fireinsite.org) to see the current version of the model.

## Brief introduction

FireInSite is a web-based application that forecasts fuel moisture, probability of ignition, surface fire rate of spread, flame length and fireline intensity for a user selected location for a set of temperate shrub and grass-dominated vegetation types (fuels) in the UK.

FireInSite is built on over four years of intensive data collection of fuel moisture, vegetation flammability and energy contents taken from across the UK in characteristic fuels and these have been used to develop fuel models that describe the fire prone fuel types of the UK landscape. While the fuel models have been specifically designed and tailored to UK vegetation, the model can be used in other regions with similar humid temperate climates.

The model integrates terrain information from Mapbox digital elevation tiles, weather data by Open-Meteo with BehavePlus fire behaviour model to provide both fire behaviour forecasts for five days and/or hindcasts (using historic weather).

In forecast mode, a separate EFFIS panel supplements these predictions with daily
Canadian Fire Weather Index System indices for the selected point: FWI, FFMC,
DMC, DC, ISI and BUI. It follows the selected day and includes the available daily
series, an index guide and the EFFIS FWI danger class. These ECMWF-driven indices
describe regional fire weather at approximately 8 km resolution; they remain
independent of FireInSite's selected fuel, terrain and weather model. FFMC is an
index, not a fuel moisture percentage.

The panel uses `/api/effis/point?lat=…&lon=…`, a server-side adapter for the EFFIS
viewer chart service. No API key is required. Successful responses are cached for
five minutes in browsers and fifteen minutes at the CDN. Missing values and
upstream errors are handled independently of the fire behaviour forecast.
Historical and user-defined weather modes do not display the current EFFIS
forecast. Source: [Copernicus Emergency Management Service / EFFIS](https://forest-fire.emergency.copernicus.eu/about-effis/technical-background/fire-danger-forecast),
with [CC BY 4.0 attribution](https://forest-fire.emergency.copernicus.eu/about-effis/data-license).

The application is designed to be user-friendly and accessible to a wide range of users, including land managers, fire service personel and researchers.

Built with Svelte and flowbite.

The main forecast page shows model settings in a persistent sidebar on screens
1280 px and wider. On smaller screens the same controls open in a dedicated
Model settings drawer, separate from navigation. Day and hour controls use the
forecast location's time; choosing another day preserves the selected hour.
Chart view and output selection remain beside the fire behaviour results.

For local development, set `VITE_MAPBOX_GL_TOKEN` in `.env` to use the deployed
satellite-map setup. Without a token, the location picker uses MapLibre and a
street basemap from FOSSGIS/OpenStreetMap Germany, served through a cached
same-origin tile endpoint. This community service is for modest noncommercial
interactive use. `VITE_OSM_TILE_URL` can select another OSM-compatible XYZ source.

## Authors

* **Tadas Nikonovas** - (https://github.com/tadasnik)
* **Claire Belcher**
* **Kerryn Little**


## License

This project is licensed under the MIT License.

## Acknowledgments

* Fire behaviour code: https://github.com/cbevins/fire-behavior-simulator
* Weather API: https://open-meteo.com
* Mapbox API: https://www.mapbox.com/about/maps/

* Supported by Higher Education Funding Council for Wales Impact Fellowship grant (RIG1062-117)
* NERC grant UK-FDRS ‘Toward a UK fire danger rating system: Understanding fuels, fire behaviour and impacts’ (NE/T003553/1)

## Developing

The repository can be cloned and run locally on your machine for development purposes. To get started, follow the steps below.
```bash
## Create svelte project and install dependencies:

# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app

# create a new project in my-app
npm install 

```
##  Local server

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
