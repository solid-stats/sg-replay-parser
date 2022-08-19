import combineSamePlayersInfo from '../../../2 - parseReplayInfo/combineSamePlayersInfo';
import generatePlayerInfo from '../../utils/generators/generatePlayerInfo';
import getDefaultTestDescription from '../../utils/getDefaultTestDescription';

type TestData = {
  entities: PlayersList;
  result: PlayerInfo[];
};

const playersInfo: PlayerInfo[] = [
  generatePlayerInfo({
    id: 0, name: '[FNX]Afgan0r', kills: 2, teamkills: 1,
  }),
  generatePlayerInfo({
    id: 1, name: '[FNX]Afgan0r', teamkills: 1, isDead: true,
  }),
  generatePlayerInfo({
    id: 2, name: '[FNX]Afgan0r', isDead: true, isDeadByTeamkill: true,
  }),
  generatePlayerInfo({ id: 3, name: '[FNX]LOXDOR', kills: 2 }),
];

const testData: TestData = {
  entities: { ...playersInfo },
  result: [
    generatePlayerInfo({
      id: 2, name: '[FNX]Afgan0r', kills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: true,
    }),
    playersInfo[3],
  ],
};

test(getDefaultTestDescription('combineSamePlayersInfo'), () => {
  expect(combineSamePlayersInfo(testData.entities)).toMatchObject(testData.result);
});
