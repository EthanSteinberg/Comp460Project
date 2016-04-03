const buildingConstants = {
  mine: {
    name: 'Mine',
    description: 'Generates coin.',
    coinCost: 50,
    buildTime: 50, // In ticks
    maxCoinFlow: 2,
  },

  shipyard: {
    name: 'Shipyard',
    description: 'Produces ships.',
    coinCost: 100,
    buildTime: 100, // In ticks
    maxCoinFlow: 1,
  },

  fort: {
    name: 'Fort',
    description: 'A building to protect our lands.',
    coinCost: 100,
    buildTime: 100, // In ticks
    maxCoinFlow: 1,
  },
};

export default buildingConstants;
