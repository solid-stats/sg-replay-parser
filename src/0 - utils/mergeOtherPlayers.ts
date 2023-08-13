import { cloneDeep } from 'lodash';

const mergeOtherPlayers = (first: OtherPlayer[], second: OtherPlayer[]): OtherPlayer[] => {
  const result = cloneDeep(first);

  second.forEach((newPlayer) => {
    const index = result.findIndex((player) => player.id === newPlayer.id);
    const currentPlayer = result[index];

    if (currentPlayer) {
      result[index] = {
        id: currentPlayer.id,
        name: newPlayer.name,
        count: currentPlayer.count + newPlayer.count,
      };

      return;
    }

    result.push(newPlayer);
  });

  return result;
};

export default mergeOtherPlayers;
