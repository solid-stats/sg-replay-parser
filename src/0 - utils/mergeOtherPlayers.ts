import { cloneDeep } from 'lodash';

const mergeOtherPlayers = (first: OtherPlayer[], second: OtherPlayer[]): OtherPlayer[] => {
  const result = cloneDeep(first);

  second.forEach((newPlayer) => {
    const index = result.findIndex((player) => player.name === newPlayer.name);
    const currentPlayer = result[index];

    if (currentPlayer) {
      result[index] = {
        name: currentPlayer.name,
        count: currentPlayer.count + newPlayer.count,
      };

      return;
    }

    result.push(newPlayer);
  });

  return result;
};

export default mergeOtherPlayers;
