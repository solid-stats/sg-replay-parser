const formatGameType = (gameType: GameType): FormattedGameType => {
  switch (gameType) {
    case 'sg': {
      return 'SG';
    }
    case 'mace': {
      return 'Mace';
    }
    default: {
      return gameType;
    }
  }
};

export default formatGameType;
