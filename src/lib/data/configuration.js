export const modelConfigOptions = {
  'configure.fuel.primary': {
    options: ['catalog', 'behave', 'chaparral', 'palmettoGallberry', 'westernAspen'],
    value: 'catalog',
    active: false,
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
    active: false,
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
    active: false,
    description: `The cured herb fraction for BehavePlus fuel models is

    'input': entered directly
    'estimated': estimated from live fuel moisture
    `,
  },
  'configure.fuel.moisture': {
    options: ['individual', 'liveCategory', 'category'],
    value: 'category',
    active: false,
    description: `When required as input, fuel moisture is entered for

    'individual': the 3 dead and 2 live fuel moisture classes
    'liveCategory': the 3 dead moisture classes and a singe live category moisture
    'fosberg': calculated from temperature, humidity, slope, aspect, month, time
    'category': the dead and live category moistures only
    `,
  },
  'configure.slope.steepness': {
    options: ['ratio', 'degrees', 'map'],
    value: 'degrees',
    active: false,
    description: `When required as input, slope steepness is

    'ratio': entered as ratio of vertical rise to horizontal reach
    'degrees': entered as degrees of angle above the horizontal plane
    'map': estimated from map measurements
  `,
  },
  'configure.wind.direction': {
    options: ['sourceFromNorth', 'headingFromUpslope', 'upslope'],
    value: 'upslope',
    active: false,
    description: `When required as input, wind direction is

    'sourceFromNorth': the direction FROM which the wind is blowing (degrees from NORTH)
    'headingFromUpslope': the direcion TOWARDS which the wind is blowing (degrees from UPSLOPE)
    'upslope': assumed to be blowing upslope
  `,
  },
  'configure.wind.speed': {
    options: ['at10m', 'at20ft', 'atMidflame'],
    value: 'atMidflame',
    active: false,
    description: `When required as an input, wind speed is entered for

    'at10m': 10-m height
    'at20ft': 20-ft height
    'atMidflame': midflame height`
  },
  'configure.fire.effectiveWindSpeedLimit': {
     options: ['applied', 'ignored'],
     value: 'applied',
    active: false,
     description: `The fire spread rate effective wind speed limit (see Rothermel 1972) is

    'applied'
    'ignored'
    `,
  },
  'configure.fire.firelineIntensity': {
    options: ['firelineIntensity', 'flameLength'],
    value: 'flameLength',
    active: false,
    description: `When required as an input, fireline intensity is

    'firelineIntensity': entered directly
    'flameLength': estimated from the flame length input
    `,
  },
  'configure.fire.lengthToWidthRatio': {
    options: ['lengthToWidthRatio', 'effectiveWindSpeed'],
    value: 'lengthToWidthRatio',
    active: false,
    description: `When required as an input, fire ellipse length-to-width ratio is

    'lengthToWidthRatio': entered directly
    'effectiveWindSpeed': estimated from the effective wind speed input
    `,
  },
  'configure.fire.weightingMethod': {
    options: ['arithmetic', 'harmonic'],
    value: 'arithmetic',
    active: false,
    description: `Weighted fire spread rate of 2 surface fuel types is based on

    'arithmetic': arithmetic mean spread rate
    'expected': NOT IMPLEMENTED
    'harmonic': harmonic mean spread rate
    `,
  },
  'configure.fire.vector': {
    options: ['fromHead', 'fromUpslope', 'fromNorth'],
    value: 'fromHead',
    active: false,
    description: `When required as input, fire vector direction inputs are

    'fromHead': degrees clockwise from direction of maximum spread
    'fromUpslope': degrees clockwise from upslope
    'fromNorth': degrees clockwise from north
    `,
  },
  'configure.fuel.windSpeedAdjustmentFactor': {
    options: ['input', 'estimated'],
    value: 'estimated',
    active: false,
    description: `When required as input, midflame wind speed adjustment factor is

    'input': entered directly
    'estimated': estimated from canopy and fuel parameters
    `,
  },
  'configure.fuel.chaparralTotalLoad': {
  options: ['input', 'estimated'],
  value: 'input',
  active: false,
  description: `When required as input, chaparral total fuel load is

    'input': entered directly
    'estimated': estimated from chaparral depth
  `,
  }
}
