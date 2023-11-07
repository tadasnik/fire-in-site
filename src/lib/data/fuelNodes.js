export const fuelNodes = {
	'surface.primary.fuel.model.behave.parms.depth': {
		label: 'Fuel depth',
		catalogParam: 'depth',
		units: 'm',
		selected: true,
		value: [0.2],
		defValue: 0.2,
		decimals: 1,
		max: 5,
		min: 0.01,
		step: 0.1
	},

	'surface.primary.fuel.model.behave.parms.live.heatOfCombustion': {
		label: 'Live fuel heat',
		catalogParam: 'liveHeat',
		units: 'J/kg',
		selected: false,
		value: [0.2],
		defValue: 0.2,
		decimals: 0,
		max: 25000000,
		min: 1000000,
		step: 100000
	},

	'surface.primary.fuel.model.behave.parms.dead.heatOfCombustion': {
		label: 'Dead fuel heat',
		catalogParam: 'deadHeat',
		units: 'J/kg',
		selected: true,
		value: [0.2],
		defValue: 0.2,
		decimals: 0,
		max: 25000000,
		min: 1000000,
		step: 100000
	},

	'surface.primary.fuel.model.behave.parms.dead.tl1h.ovendryLoad': {
		label: 'Dead 1h load',
		catalogParam: 'dead1Load',
		units: 'kg/m2',
		selected: true,
		value: [0.2],
		defValue: 0.2,
		decimals: 2,
		max: 2,
		min: 0,
		step: 0.1
	},

	'surface.primary.fuel.model.behave.parms.dead.tl10h.ovendryLoad': {
		label: 'Dead 10h load',
		catalogParam: 'dead10Load',
		units: 'kg/m2',
		selected: true,
		value: [0.2],
		defValue: 0.2,
		decimals: 2,
		max: 2,
		min: 0,
		step: 0.1
	},

	'surface.primary.fuel.model.behave.parms.dead.tl100h.ovendryLoad': {
		label: 'Dead 100h load',
		catalogParam: 'dead100Load',
		units: 'kg/m2',
		selected: true,
		value: [0.2],
		defValue: 0.2,
		decimals: 2,
		max: 2,
		min: 0,
		step: 0.1
	},

	'surface.primary.fuel.model.behave.parms.dead.tl1h.surfaceAreaToVolumeRatio': {
		label: 'Dead 1h SAVR',
		catalogParam: 'dead1Savr',
		units: 'cm2/cm3',
		selected: true,
		value: [0.2],
		defValue: 0.2,
		decimals: 2,
		max: 200,
		min: 1,
		step: 1
	},

	'surface.primary.fuel.model.behave.parms.dead.extinction.moistureContent': {
		label: 'Dead fuel moisture of extinction',
		catalogParam: 'deadMext',
		units: '%',
		selected: true,
		value: [15],
		defValue: 15,
		decimals: 0,
		max: 60,
		min: 1,
		step: 1
	},

	'surface.primary.fuel.model.behave.parms.live.herb.surfaceAreaToVolumeRatio': {
		label: 'Live herb SAVR',
		catalogParam: 'liveHerbSavr',
		units: 'cm2/cm3',
		selected: true,
		value: [15],
		defValue: 15,
		decimals: 2,
		max: 200,
		min: 1,
		step: 1
	},

	'surface.primary.fuel.model.behave.parms.live.stem.surfaceAreaToVolumeRatio': {
		label: 'Live stem SAVR',
		catalogParam: 'liveStemSavr',
		units: 'cm2/cm3',
		selected: true,
		value: [15],
		defValue: 15,
		decimals: 2,
		max: 200,
		min: 1,
		step: 1
	},

	'surface.primary.fuel.model.behave.parms.live.stem.ovendryLoad': {
		label: 'Live stem load',
		catalogParam: 'liveStemLoad',
		units: 'kg/m2',
		selected: true,
		value: [15],
		defValue: 15,
		decimals: 2,
		max: 2,
		min: 0,
		step: 0.01
	},

	'surface.primary.fuel.model.behave.parms.total.herb.ovendryLoad': {
		label: 'Total herb load',
		catalogParam: 'totalHerbLoad',
		units: 'kg/m2',
		selected: true,
		value: [15],
		defValue: 15,
		decimals: 2,
		max: 2,
		min: 0,
		step: 0.01
	},

	'surface.primary.fuel.model.behave.parms.cured.herb.fraction': {
		label: 'Cured herb frac.',
		catalogParam: 'curedHerbFrac',
		units: '%',
		selected: false,
		value: [15],
		defValue: 15,
		decimals: 0,
		max: 100,
		min: 0,
		step: 1
	}
}
