const formatGameType = (gameType: GameType): FormattedGameType => {
  switch (gameType) {
    case 'sg': {
      return 'SG';
    }
    case 'mace': {
      return 'Mace';
    }
    case 'sm': {
      return 'SM';
    }
    default: {
      return gameType;
    }
  }
};

export default formatGameType;
