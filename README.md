# FireInSite

A fire behaviour prediction and visualization tool. Visit (https://fireinsite.org) to see the current version of the model.

## Brief introduction

FireInSite is a web-based application that forecasts fuel moisture, probability of ignition, surface fire rate of spread, flame length and fireline intensity for a user selected location for a set of temperate shrub and grass-dominated vegetation types (fuels) in the UK.

FireInSite is built on over four years of intensive data collection of fuel moisture, vegetation flammability and energy contents taken from across the UK in characteristic fuels and these have been used to develop fuel models that describe the fire prone fuel types of the UK landscape. While the fuel models have been specifically designed and tailored to UK vegetation, the model can be used in other regions with similar humid temperate climates.

The model integrates terrain information from Mapbox digital elevation tiles, weather data by Open-Meteo with BehavePlus fire behaviour model to provide both fire behaviour forecasts for five days and/or hindcasts (using historic weather).

The application is designed to be user-friendly and accessible to a wide range of users, including land managers, fire service personel and researchers.

Built with Svelte and flowbite.

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
