const buildingConstants = {
  mine: {
    name: 'Mine',
    description: 'Generates coin.',
    coinCost: 50,
    buildTime: 50, // In ticks
    maxCoinFlow: 1,
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
    description: 'Protects an island',
    coinCost: 150,
    buildTime: 100, // In ticks
    maxCoinFlow: 1,
  },
};

export default buildingConstants;
