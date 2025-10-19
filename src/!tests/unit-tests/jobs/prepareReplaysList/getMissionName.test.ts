import { getMissionName } from '../../../../jobs/prepareReplaysList/parseReplaysOnPage';
import getDefaultTestDescription from '../../../utils/getDefaultTestDescription';

type TestData = {
  input: {
    linkText: string;
    includeReplays: ConfigIncludeReplay[];
  };
  output: string | undefined;
};

const testData: TestData[] = [
  {
    input: {
      linkText: 'Some Mission',
      includeReplays: [{ name: 'Some Mission', gameType: 'sg' }],
    },
    output: 'sg@some_mission',
  },
  {
    input: {
      linkText: 'sg@some_mission',
      includeReplays: [],
    },
    output: 'sg@some_mission',
  },
  {
    input: {
      linkText: 'Unknown Mission',
      includeReplays: [{ name: 'Other Mission', gameType: 'mace' }],
    },
    output: undefined,
  },
  {
    input: {
      linkText: 'Test Mission',
      includeReplays: [
        { name: 'Other Mission', gameType: 'mace' },
        { name: 'Test Mission', gameType: 'sm' },
      ],
    },
    output: 'sm@test_mission',
  },
  {
    input: {
      linkText: 'Mission Name',
      includeReplays: [{ name: 'mission name', gameType: 'sg' }],
    },
    output: 'sg@mission_name',
  },
];

testData.forEach(({ input, output }) => {
  test(getDefaultTestDescription('getMissionName'), () => {
    expect(getMissionName(input.linkText, input.includeReplays)).toEqual(output);
  });
});
