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
    min: 0.0,
    step: 0.1
  },

  'surface.primary.fuel.model.behave.parms.live.heatOfCombustion': {
    label: 'Live fuel heat',
    catalogParam: 'liveHeat',
    units: 'J/kg',
    selected: false,
    value: [18600000],
    defValue: 18600000,
    decimals: 0,
    max: 25000000,
    min: 1000000,
    step: 100000,
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
    max: 1,
    min: 0,
    step: 0.01
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
    step: 0.01
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
    step: 0.01
  },

  'surface.primary.fuel.model.behave.parms.dead.tl1h.surfaceAreaToVolumeRatio': {
    label: 'Dead 1h SAVR',
    catalogParam: 'dead1Savr',
    units: 'm2/m3',
    selected: true,
    value: [0.2],
    defValue: 0.2,
    decimals: 0,
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
    units: 'm2/m3',
    selected: true,
    value: [15],
    defValue: 15,
    decimals: 0,
    max: 200,
    min: 1,
    step: 1
  },

  'surface.primary.fuel.model.behave.parms.live.stem.surfaceAreaToVolumeRatio': {
    label: 'Live stem SAVR',
    catalogParam: 'liveStemSavr',
    units: 'm2/m3',
    selected: true,
    value: [15],
    defValue: 15,
    decimals: 0,
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
  },
  'site.moisture.dead.category': {
    geneLabel: 'site.moisture.dead.category',
    label: 'Dead fuel moisture',
    code: 'deadFuelMoisture',
    units: '%',
    selected: true,
    defValue: 15,
    value: [10, 20],
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


}
