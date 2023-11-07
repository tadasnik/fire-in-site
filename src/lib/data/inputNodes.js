export const inputNodes = {
	'site.wind.speed.atMidflame': {
		label: 'Wind speed',
		code: 'windSpeed',
		units: 'km/h',
		selected: true,
		defValue: 5,
		value: [5],
		decimals: 0,
		max: 30,
		min: 0,
		step: 1,
		description: 'Wind speed at midflame height'
	},

	'site.wind.speed.at10m': {
		label: 'Wind speed at 10 metres',
		code: 'windSpeed10',
		units: 'km/h',
		selected: true,
		defValue: 5,
		value: [5],
		decimals: 0,
		max: 30,
		min: 0,
		step: 1
	},

	'site.windSpeedAdjustmentFactor': {
		label: 'Wind speed adjustment factor',
		code: 'windSpeedAdjust',
		units: 'ratio',
		selected: true,
		defValue: 0.5,
		value: [0.5],
		decimals: 1,
		max: 1,
		min: 0,
		step: 0.1
	},

	'site.slope.steepness.degrees': {
		geneLabel: 'site.slope.steepness.degrees',
		label: 'Terrain slope',
		code: 'slopeAngle',
		units: 'deg',
		selected: true,
		defValue: 5,
		value: [5],
		decimals: 0,
		max: 40,
		min: 0,
		step: 1,
		description: 'Slope steepness is the maximum steepness of the slope on which a fire is burning.'
	},

	'site.moisture.dead.category': {
		geneLabel: 'site.moisture.dead.category',
		label: 'Dead fuel moisture',
		code: 'deadFuelMoisture',
		units: '%',
		selected: true,
		defValue: 15,
		value: [15],
		decimals: 0,
		max: 50,
		min: 0,
		step: 1
	},

	'site.moisture.dead.tl1h': {
		label: 'Dead 1h fuel moisture',
		code: 'dead1hFuelMoisture',
		units: '%',
		selected: true,
		defValue: 15,
		value: [15],
		decimals: 0,
		max: 50,
		min: 0,
		step: 1,
		description:
			'1-h fuel moisture content is the portion (percent or fraction) of the 1-h timelag dead fuel that is water, calculated on a dry weight basis.'
	},

	'site.moisture.dead.tl10h': {
		label: 'Dead 10h fuel moisture',
		code: 'dead10hFuelMoisture',
		units: '%',
		selected: true,
		defValue: 20,
		value: [20],
		decimals: 0,
		max: 50,
		min: 0,
		step: 1,
		description:
			'The 10-h fuel moisture content is the portion of the 10-h timelag dead fuel that is water, calculated on a dry weight basis.'
	},

	'site.moisture.dead.tl100h': {
		label: 'Dead 100h fuel moisture',
		code: 'dead100hFuelMoisture',
		units: '%',
		selected: true,
		defValue: 30,
		value: [30],
		decimals: 0,
		max: 60,
		min: 0,
		step: 1,
		description:
			'The 100-h fuel moisture content is the portion of the 100-h timelag dead fuel that is water, calculated on a dry weight basis.'
	},

	'site.moisture.live.herb': {
		label: 'Live herb fuel moisture',
		code: 'liveHerbFuelMoisture',
		units: '%',
		selected: true,
		defValue: 80,
		value: [80],
		decimals: 0,
		max: 300,
		min: 30,
		step: 1,
		description:
			'Live herbaceous fuel moisture content is the portion of the live grasses and forbs that is water, calculated on a dry weight basis.'
	},

	'site.moisture.live.stem': {
		label: 'Live stem fuel moisture',
		code: 'liveStemFuelMoisture',
		units: '%',
		selected: true,
		defValue: 100,
		value: [100],
		decimals: 0,
		max: 300,
		min: 30,
		step: 1,
		description:
			'Live woody fuel moisture content is the portion of the shrub foliage and very fine stems that is water. It is calculated on a dry weight basis.'
	},

	'site.moisture.live.category': {
		geneLabel: 'site.moisture.live.category',
		label: 'Live fuel moisture',
		code: 'liveFuelMoisture',
		units: '%',
		selected: true,
		defValue: 100,
		value: [100],
		ecimals: 0,
		max: 300,
		min: 30,
		step: 1
	},

	'site.fire.time.sinceIgnition': {
		label: 'Time since ignition',
		code: 'timeSinceIgnition',
		units: 'h',
		selected: false,
		defValue: 1,
		value: 1,
		decimals: 0,
		max: 24,
		step: 1
	},

	'site.temperature.air': {
		label: 'Air temperature',
		code: 'airTemperature',
		units: 'oC',
		selected: true,
		defValue: 20,
		value: [20],
		decimals: 0,
		max: 45,
		min: 0,
		step: 1,
		description: 'Air temeperature in degrees Celsius'
	},

	'site.canopy.tree.dbh': {
		label: 'Tree diameter at chest height',
		code: 'treeDBH',
		units: 'm',
		selected: true,
		defValue: 0.3,
		value: [0.3],
		decimals: 1,
		max: 2,
		min: 0,
		step: 0.1,
		description: 'A measurement of the diameter of a tree at about 1.4 metres from the ground'
	},

	'site.canopy.tree.species.fofem6.code': {
		label: 'Tree species',
		code: 'treeSpecies',
		units: '',
		selected: false,
		defValue: 'PINSPP',
		value: 'PINSPP',
		decimals: 0,
		max: 0,
		min: 0,
		step: 0.1
	},

	'site.canopy.crown.baseHeight': {
		label: 'Canopy base height',
		code: 'baseHeight',
		units: 'm',
		selected: true,
		defValue: 8,
		value: 8,
		max: 20,
		min: 1,
		step: 1,
		description:
			'The canopy base height for an individual tree is the height at which there is sufficient fuel density to sustain canopy ignition. For a stand of trees, canopy base height considers both the main canopy layer and ladder fuels in the understory.'
	},

	'site.canopy.crown.totalHeight': {
		label: 'Canopy total height',
		code: 'totalHeight',
		units: 'm',
		selected: true,
		defValue: 20,
		value: 20,
		decimals: 0,
		max: 30,
		min: 2,
		step: 1,
		description: 'Canopy height describes the average tree height in a stand.'
	},

	'site.canopy.fuel.bulkDensity': {
		label: 'Canopy buld density',
		code: 'bulkDensity',
		units: 'kg/m3',
		selected: true,
		defValue: 1,
		value: 1,
		decimals: 1,
		max: 5,
		min: 0,
		step: 0.1,
		description:
			'Canopy bulk density is a stand description of weight of canopy fuels per unit of canopy volume (kg/m3).'
	},

	'site.canopy.fuel.foliar.moistureContent': {
		label: 'Canopy moisture content',
		code: 'foliarMoisture',
		units: '%',
		selected: true,
		defValue: 100,
		value: 100,
		decimals: 0,
		max: 300,
		min: 30,
		step: 1,
		description:
			'Foliar moisture is the moisture content of the overstory foliage: the conifer needles.'
	},

	'surface.weighted.fire.primaryCover': {
		geneLabel: 'surface.weighted.fire.primaryCover',
		label: 'Primary fuel percent',
		code: 'FuelCoverFraction',
		units: '%',
		selected: true,
		defValue: 50,
		value: [50],
		decimals: 0,
		max: 100,
		min: 0,
		step: 1
	},
}

