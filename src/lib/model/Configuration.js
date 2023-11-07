export const modelConfigOptions = {
  'configure.fuel.primary': {
    options: ['catalog', 'behave', 'chaparral', 'palmettoGallberry', 'westernAspen'],
    value: 'catalog',
    description: `Primary surface fuels are specified by entering

    'catalog': a fuel model catalog key
    'behave': standard BehavePlus fuel parameters
    'chaparral': chaparral dynamic fuel parameters
    'palmettoGallberry': palmetto-gallberry dynamic fuel parameters
    'westernAspen': western aspen dynamic fuel parameters
    `,
    },
   'configure.fuel.secondary': {
     options: [
      'none',
      'catalog',
      'behave',
      'chaparral',
      'palmettoGallberry',
      'westernAspen',
    ],
    value: 'none',
    description: `Secondary surface fuels are specified by entering

    'none': there are no secondary fuels
    'catalog': a fuel model catalog key
    'behave': standard BehavePlus fuel parameters
    'chaparral': chaparral dynamic fuel parameters
    'palmettoGallberry': palmetto-gallberry dynamic fuel parameters
    'westernAspen': western aspen dynamic fuel parameters
    `,
  },
  'configure.fuel.curedHerbFraction': {
    options: ['input', 'estimated'],
    value: 'estimated',
    description: `The cured herb fraction for BehavePlus fuel models is

    'input': entered directly
    'estimated': estimated from live fuel moisture
    `,
  },
  'configure.fuel.moisture': {
    options: ['individual', 'liveCategory', 'category', 'catalog'],
    value: 'category',
    description: `When required as input, fuel moisture is entered for

    'individual': the 3 dead and 2 live fuel moisture classes
    'liveCategory': the 3 dead moisture classes and a singe live category moisture
    'fosberg': calculated from temperature, humidity, slope, aspect, month, time
    'category': the dead and live category moistures only
    'catalog' NOT IMPLEMENTED
    `,
  },
  'configure.slope.steepness': {
    options: ['ratio', 'degrees', 'map'],
    value: 'dagrees',
    description: `When required as input, slope steepness is

    'ratio': entered as ratio of vertical rise to horizontal reach
    'degrees': entered as degrees of angle above the horizontal plane
    'map': estimated from map measurements
  `,
  },
  'configure.wind.direction': {
    options: ['sourceFromNorth', 'headingFromUpslope', 'upslope'],
    value: 'upslope',
    description: `When required as input, wind direction is

    'sourceFromNorth': the direction FROM which the wind is blowing (degrees from NORTH)
    'headingFromUpslope': the direcion TOWARDS which the wind is blowing (degrees from UPSLOPE)
    'upslope': assumed to be blowing upslope
  `,
  },
  'configure.wind.speed': {
    options: ['at10m', 'at20ft', 'atMidflame'],
    value: 'atMidflame',
    description: `When required as an input, wind speed is entered for

    'at10m': 10-m height
    'at20ft': 20-ft height
    'atMidflame': midflame height`
  },
  'configure.fire.effectiveWindSpeedLimit': {
     options: ['applied', 'ignored'],
     value: 'applied',
     description: `The fire spread rate effective wind speed limit (see Rothermel 1972) is

    'applied'
    'ignored'
    `,
  },
  'configure.fire.firelineIntensity': {
    options: ['firelineIntensity', 'flameLength'],
    value: 'flameLength',
    description: `When required as an input, fireline intensity is

    'firelineIntensity': entered directly
    'flameLength': estimated from the flame length input
    `,
  },
  'configure.fire.lengthToWidthRatio': {
    options: ['lengthToWidthRatio', 'effectiveWindSpeed'],
    value: 'lengthToWidthRatio',
    description: `When required as an input, fire ellipse length-to-width ratio is

    'lengthToWidthRatio': entered directly
    'effectiveWindSpeed': estimated from the effective wind speed input
    `,
  },
  'configure.fire.weightingMethod': {
    options: ['arithmetic', 'expected', 'harmonic'],
    value: 'arithmetic',
    description: `Weighted fire spread rate of 2 surface fuel types is based on

    'arithmetic': arithmetic mean spread rate
    'expected': NOT IMPLEMENTED
    'harmonic': harmonic mean spread rate
    `,
  },
  'configure.fire.vector': {
    options: ['fromHead', 'fromUpslope', 'fromNorth'],
    value: 'fromHead',
    description: `When required as input, fire vector direction inputs are

    'fromHead': degrees clockwise from direction of maximum spread
    'fromUpslope': degrees clockwise from upslope
    'fromNorth': degrees clockwise from north
    `,
  },
  'configure.fuel.windSpeedAdjustmentFactor': {
    options: ['input', 'estimated'],
    value: 'estimated',
    description: `When required as input, midflame wind speed adjustment factor is

    'input': entered directly
    'estimated': estimated from canopy and fuel parameters
    `,
  },
}

export const config = [
  [
    'configure.fuel.primary',
    ['catalog', 'behave', 'chaparral', 'palmettoGallberry', 'westernAspen'][0],
  ],
  [
    'configure.fuel.secondary',
    [
      'none',
      'catalog',
      'behave',
      'chaparral',
      'palmettoGallberry',
      'westernAspen',
    ][0],
  ],
  ['configure.fuel.curedHerbFraction', ['input', 'estimated'][1]],
  [
    'configure.fuel.moisture',
    ['individual', 'liveCategory', 'category', 'catalog'][2],
  ],
  ['configure.slope.steepness', ['ratio', 'degrees', 'map'][1]],
  [
    'configure.wind.direction',
    ['sourceFromNorth', 'headingFromUpslope', 'upslope'][2],
  ],
  ['configure.wind.speed', ['at10m', 'at20ft', 'atMidflame'][2]],
  // inactive
  ['configure.fire.effectiveWindSpeedLimit', ['applied', 'ignored'][0]],
  ['configure.fire.firelineIntensity', ['firelineIntensity', 'flameLength'][1]],
  [
    'configure.fire.lengthToWidthRatio',
    ['lengthToWidthRatio', 'effectiveWindSpeed'][0],
  ],
  ['configure.fire.weightingMethod', ['arithmetic', 'expected', 'harmonic'][0]],
  ['configure.fire.vector', ['fromHead', 'fromUpslope', 'fromNorth'][0]],
  ['configure.fuel.windSpeedAdjustmentFactor', ['input', 'estimated'][1]],
]
