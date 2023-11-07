export const outputNodes = {
	'surface.weighted.fire.spreadRate': {
		code: 'fireSpreadRate',
		group: 'primary',
		selected: true,
		label: 'Fire spread rate',
		units: 'm/min',
		decimals: 2,
		description:
			'Surface fire rate of spread is the "speed" at which the fire travels through the surface fuels. Surface fuels include the litter, grass, brush, and other dead and live vegetation within about 6 feet (1.8 meters) of the ground. \nThe SURFACE module allows the user to determine whether rate of spread calculations are done for heading fire, flanking fire, backing fire, or for specified directions from the ignition point or from the fire perimeter. The heading on the output pages specifies which spread direction option has been selected. \nThe surface fire rate of spread prediction uses the Rothermel (1972) surface fire spread model, which assumes the weather, topography and fuel are constant and uniform for the elapsed time. The basic model was developed for a head fire spreading upslope with the wind. Adaptations have been made to allow calculations for other direction options.'
	},

	'surface.weighted.fire.flameLength': {
		code: 'fireFlameLength',
		group: 'primary',
		selected: true,
		label: 'Fire flame length',
		units: 'm',
		decimals: 2,
		description:
			'Surface fire flame length of a spreading surface fire within the flaming front is measured from midway in the active flaming combustion zone to the average tip of the flames. According to Rothermel (1991), "Flame length is an elusive parameter that exists in the eye of the beholder. It is a poor quantity to use in a scientific or engineering sense, but it is so readily apparent to fireline personnel and so readily conveys a sense of fire intensity that it is worth featuring as a primary fire variable."\nBoth surface fireline intensity and surface fire flame length are related to the heat felt by a person standing next to the flames. Flame length is calculated from fireline intensity, which is a function of surface fire rate of spread and heat per unit area.'
	},

	'surface.weighted.fire.reactionIntensity': {
		code: 'fireReactionIntensity',
		group: 'primary',
		selected: true,
		label: 'Reaction intensity',
		units: 'J/m2/min',
		decimals: 0,
		description:
			'The total heat release rate per unit area of fire front, and includes heat convected, conducted, and radiated in all directions, not just in the direction of the adjacent potential fuel.'
	},

	'surface.weighted.fire.firelineIntensity': {
		code: 'fireFirelineIntensity',
		group: 'primary',
		selected: true,
		label: 'Fireline intensity',
		units: 'J/m/s',
		decimals: 0,
		description:
			'Surface fireline intensity is the heat energy release per unit time from a one-foot (one-meter) wide section of the fuel bed extending from the front to the rear of the flaming zone of a surface fire. Surface fireline intensity is a function of surface fire rate of spread and surface fire heat per unit area. \nBoth surface fireline intensity and surface fire flame length are related to the heat felt by a person standing next to the flames. Surface fireline intensity is directly related to and is used in the calculation of flame length.'
	},

	'surface.fire.ellipse.size.area': {
		code: 'Area',
		group: 'ellipse',
		selected: false,
		label: 'Fire ellipse area',
		units: 'ha',
		decimals: 2
	},

	'surface.weighted.fire.lengthToWidthRatio': {
		code: 'LengthWidthRatio',
		group: 'ellipse',
		selected: false,
		label: 'Fire ellipse length/width ratio',
		units: 'ratio',
		decimals: 2
	},

	'crown.fire.active.spreadRate': {
		code: 'crownFireSpreadRate',
		group: 'crown',
		selected: true,
		label: 'Crown fire spread rate',
		units: 'm/min',
		decimals: 2,
		description:
			"Active crown fire rate of spread is the head fire (forward) spread rate of a crown fire estimated using Rothermel's (1991) crown fire spread model. It is the overall spread for a sustained run over several hours and implicitly includes the effects of spotting. It does not consider a description of the overstory. The active crown fire rate of spread is calculated from 20-foot wind speed and surface fuel moisture values."
	},

	'crown.fire.active.flameLength': {
	  code: 'crownFireFlameLength',
		group: 'crown',
		selected: true,
		geneLabel: 'crown.fire.active.flameLength',
		label: 'Crown fire flame length',
		units: 'm',
		decimals: 2,
		description:
			'Active crown fire flame length, based on 20-foot wind speed, is calculated from active crown fireline intensity as described by Rothermel (1991). The flame length equation is taken from Thomas (1963) and differs from that used for surface fire (Byram 1959). Active crown fire flame length is also used to find spotting distance from active crown fire.'
	},
  'crown.fire.initiation.transitionRatio': {
	  code: 'transitionRatio',
		group: 'crown',
		selected: true,
		label: 'Crown fire transition ratio',
		units: 'ratio',
		decimals: 1,
		description:
			'Transition ratio is the surface fireline intensity divided by the critical surface fireline intensity. If the transition ratio is greater than or equal to 1, then the surface fireline intensity is sufficient for a transition to crown fire. The transition ratio provides more information than the Yes or No answer provided by the transition to crown fire? variable. It is helpful to know whether the transition ratio is close to 1 or very different from 1. A value much higher than 1 may indicate that a transition to crown fire is more likely, while a value much less than 1 may indicate that the fire is more likely to remain a surface fire. As always, expert knowledge should be used to confirm model predictions.'
	},

	'crown.fire.initiation.activeRatio': {
		code: 'activeRatio',
		group: 'crown',
		selected: false,
		label: 'Active crown fire ratio',
		units: 'ratio',
		decimals: 1,
		description:
			'The active ratio is crown fire rate of spread divided by the critical crown fire rate of spread. If the active ratio is greater than or equal to 1, then the fire may be an active crown fire. The active ratio provides more information than the Yes or No answer provided by the active crown fire? variable. It is instructive to know whether the active ratio is close to 1 or significantly different from 1. A value much higher than 1 may indicate that an active crown fire is more likely, while a value much less than 1 may indicate that the fire is more likely to remain a surface fire. As always, expert knowledge should be used to confirm model predictions.'
	},

	'surface.primary.fuel.fire.scorchHeight': {
		code: 'scorchHeight',
		group: 'effects',
		selected: true,
		label: 'Scorch height',
		units: 'm',
		decimals: 2,
		description:
			'Scorch height is the maximum vertical height above the ground at which lethal scorching of foliage occurs. Below this height, the temperature in the convection column is greater than or equal to the lethal temperature necessary to kill live crown foliage. This temperature is assumed to be 140 degrees Fahrenheit (60 degrees Celsius). \nIf both SURFACE and SCORCH modules are selected, midflame wind speed and the flame length in the direction of the spread calculation are used as inputs to SCORCH.'
	},

	'mortality.rate': {
		code: 'mortalityRate',
		group: 'effects',
		selected: true,
		label: 'Tree mortality rate',
		units: '%',
		decimals: 0,
		description:
			'Probability of mortality is the likelihood that a tree will be killed by a fire. The equation used to calculate probability of mortality depends on the mortality tree species. There are 13 mortality equations, which variously include bark thickness, tree crown length scorched and/or tree crown volume scorched. \nProbability of mortality can be interpreted as the probability of an individual tree dying, or it can be multiplied by the number of trees on a site to estimate the number of trees that will die.'
	}
}


