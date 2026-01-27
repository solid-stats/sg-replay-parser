# Unified App Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the project into a cohesive single application with a domain-modular layout, shared utilities/types, clear service boundaries, and co-located tests.

**Architecture:** Introduce `src/shared` for cross-cutting consts/types/utils/testing helpers, `src/modules/<domain>` for core business logic (`replays`, `parsing`, `statistics`, `output`, `yearStatistics`), `src/services/*` for pipeline orchestration, `src/jobs/*` as entrypoints, and keep `src/db` for persistence. Tests are co-located with implementation (single test next to file; multiple tests in `__tests__/`).

**Tech Stack:** Node.js, TypeScript, Jest (ts-jest), Prisma/SQLite, fs-extra.

### Task 1: Create shared testing helpers

**Files:**
- Create: `src/shared/testing/getDefaultTestDescription.test.ts`
- Create: `src/shared/testing/index.ts`
- Move: `src/!tests/utils/getDefaultTestDescription.ts` → `src/shared/testing/getDefaultTestDescription.ts`
- Move: `src/!tests/utils/getDefaultMissionName.ts` → `src/shared/testing/getDefaultMissionName.ts`
- Move: `src/!tests/utils/getNameById.ts` → `src/shared/testing/getNameById.ts`
- Move: `src/!tests/utils/prepareNamesWithMock.ts` → `src/shared/testing/prepareNamesWithMock.ts`
- Move: `src/!tests/utils/consts.ts` → `src/shared/testing/consts.ts`
- Move: `src/!tests/utils/types.d.ts` → `src/shared/testing/types.d.ts`
- Move: `src/!tests/utils/generators/generateNameChangeItem.ts` → `src/shared/testing/generators/generateNameChangeItem.ts`
- Move: `src/!tests/utils/generators/generateKillEvent.ts` → `src/shared/testing/generators/generateKillEvent.ts`
- Move: `src/!tests/utils/generators/generateDefaultWeapons.ts` → `src/shared/testing/generators/generateDefaultWeapons.ts`
- Move: `src/!tests/utils/generators/generateConnectEvent.ts` → `src/shared/testing/generators/generateConnectEvent.ts`
- Move: `src/!tests/utils/generators/generatePlayerEntity.ts` → `src/shared/testing/generators/generatePlayerEntity.ts`
- Move: `src/!tests/utils/generators/generateDefaultOtherPlayers.ts` → `src/shared/testing/generators/generateDefaultOtherPlayers.ts`
- Move: `src/!tests/utils/generators/generateReplay.ts` → `src/shared/testing/generators/generateReplay.ts`
- Move: `src/!tests/utils/generators/generateReplayInfo.ts` → `src/shared/testing/generators/generateReplayInfo.ts`
- Move: `src/!tests/utils/generators/generateVehicleEntity.ts` → `src/shared/testing/generators/generateVehicleEntity.ts`
- Move: `src/!tests/utils/generators/generateGlobalStatistics.ts` → `src/shared/testing/generators/generateGlobalStatistics.ts`
- Move: `src/!tests/utils/generators/generatePlayerInfo.ts` → `src/shared/testing/generators/generatePlayerInfo.ts`

**Step 1: Write the failing test**

```ts
import getDefaultTestDescription from './getDefaultTestDescription';

test('formats test descriptions', () => {
  expect(getDefaultTestDescription('getReplays')).toBe('getReplays should return correct value');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/shared/testing/getDefaultTestDescription.test.ts`
Expected: FAIL with "Cannot find module './getDefaultTestDescription'"

**Step 3: Write minimal implementation**

```ts
const getDefaultTestDescription = (value: string) => `${value} should return correct value`;

export default getDefaultTestDescription;
```

Also add `src/shared/testing/index.ts` to re-export helpers:

```ts
export { default as getDefaultTestDescription } from './getDefaultTestDescription';
export { default as getDefaultMissionName } from './getDefaultMissionName';
export { default as getNameById } from './getNameById';
export { default as prepareNamesWithMock } from './prepareNamesWithMock';
export * from './consts';
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/shared/testing/getDefaultTestDescription.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared/testing

git commit -m "refactor(shared): add shared testing helpers"
```

### Task 2: Move shared utils with co-located tests

**Files:**
- Move: `src/utils/calculateKDRatio.ts` → `src/shared/utils/calculateKDRatio.ts`
- Move: `src/utils/calculateScore.ts` → `src/shared/utils/calculateScore.ts`
- Move: `src/utils/calculateVehicleKillsCoef.ts` → `src/shared/utils/calculateVehicleKillsCoef.ts`
- Move: `src/utils/dayjs.ts` → `src/shared/utils/dayjs.ts`
- Move: `src/utils/filterPlayersByTotalPlayedGames.ts` → `src/shared/utils/filterPlayersByTotalPlayedGames.ts`
- Move: `src/utils/formatGameType.ts` → `src/shared/utils/formatGameType.ts`
- Move: `src/utils/generateBasicFolders.ts` → `src/shared/utils/generateBasicFolders.ts`
- Move: `src/utils/generateBasicHTML.ts` → `src/shared/utils/generateBasicHTML.ts`
- Move: `src/utils/getPlayerName.ts` → `src/shared/utils/getPlayerName.ts`
- Move: `src/utils/isDev.ts` → `src/shared/utils/isDev.ts`
- Move: `src/utils/isInInterval.ts` → `src/shared/utils/isInInterval.ts`
- Move: `src/utils/logger.ts` → `src/shared/utils/logger.ts`
- Move: `src/utils/mergeOtherPlayers.ts` → `src/shared/utils/mergeOtherPlayers.ts`
- Move: `src/utils/pipe.ts` → `src/shared/utils/pipe.ts`
- Move: `src/utils/paths.ts` → `src/shared/utils/paths.ts`
- Move: `src/utils/removeDatesFromGlobalStatistics.ts` → `src/shared/utils/removeDatesFromGlobalStatistics.ts`
- Move: `src/utils/request.ts` → `src/shared/utils/request.ts`
- Move: `src/utils/rotations.ts` → `src/shared/utils/rotations.ts`
- Move: `src/utils/weaponsStatistic.ts` → `src/shared/utils/weaponsStatistic.ts`
- Move: `src/utils/namesHelper/getId.ts` → `src/shared/utils/namesHelper/getId.ts`
- Move: `src/utils/namesHelper/index.ts` → `src/shared/utils/namesHelper/index.ts`
- Move: `src/utils/namesHelper/moscowDateToUTC.ts` → `src/shared/utils/namesHelper/moscowDateToUTC.ts`
- Move: `src/utils/namesHelper/findNameInfo.ts` → `src/shared/utils/namesHelper/findNameInfo.ts`
- Move: `src/utils/namesHelper/utils/types.ts` → `src/shared/utils/namesHelper/utils/types.ts`
- Move: `src/utils/namesHelper/utils/consts.ts` → `src/shared/utils/namesHelper/utils/consts.ts`
- Move: `src/utils/namesHelper/prepareNamesList.ts` → `src/shared/utils/namesHelper/prepareNamesList.ts`
- Move tests: `src/!tests/unit-tests/utils/calculateKDRatio.test.ts` → `src/shared/utils/calculateKDRatio.test.ts`
- Move tests: `src/!tests/unit-tests/utils/calculateScore.test.ts` → `src/shared/utils/calculateScore.test.ts`
- Move tests: `src/!tests/unit-tests/utils/dayjs.test.ts` → `src/shared/utils/dayjs.test.ts`
- Move tests: `src/!tests/unit-tests/utils/filterPlayersByTotalPlayedGames.test.ts` → `src/shared/utils/filterPlayersByTotalPlayedGames.test.ts`
- Move tests: `src/!tests/unit-tests/utils/getPlayerName.test.ts` → `src/shared/utils/getPlayerName.test.ts`
- Move tests: `src/!tests/unit-tests/utils/mergeOtherPlayers.test.ts` → `src/shared/utils/mergeOtherPlayers.test.ts`
- Move tests: `src/!tests/unit-tests/utils/removeDatesFromGlobalStatistics.test.ts` → `src/shared/utils/removeDatesFromGlobalStatistics.test.ts`
- Move tests: `src/!tests/unit-tests/utils/weaponsStatistic.test.ts` → `src/shared/utils/weaponsStatistic.test.ts`
- Move tests: `src/!tests/unit-tests/utils/namesHelper.test.ts` → `src/shared/utils/namesHelper/__tests__/namesHelper.test.ts`
- Move tests: `src/!tests/unit-tests/utils/namesHelper/prepareNamesList.test.ts` → `src/shared/utils/namesHelper/__tests__/prepareNamesList.test.ts`
- Move snapshots: `src/!tests/unit-tests/utils/__snapshots__/namesHelper.test.ts.snap` → `src/shared/utils/namesHelper/__tests__/__snapshots__/namesHelper.test.ts.snap`

**Step 1: Write the failing test**

```ts
import calculateKDRatio from './calculateKDRatio';

test('calculateKDRatio returns expected value', () => {
  const result = calculateKDRatio(3, 0, { total: 2, byTeamkills: 0 });
  expect(result).toBe(1.5);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/shared/utils/calculateKDRatio.test.ts`
Expected: FAIL with "Cannot find module './calculateKDRatio'"

**Step 3: Write minimal implementation**

```ts
import { round } from 'lodash';

const calculateKDRatio = (
  kills: GlobalPlayerStatistics['kills'],
  teamkills: GlobalPlayerStatistics['teamkills'],
  deaths: GlobalPlayerStatistics['deaths'],
): GlobalPlayerStatistics['kdRatio'] => {
  const deathsWithoutByTeamkills = Math.abs(deaths.total - deaths.byTeamkills);

  if (!deathsWithoutByTeamkills) return kills - teamkills;

  return round((kills - teamkills) / deathsWithoutByTeamkills, 2);
};

export default calculateKDRatio;
```

Also update imports inside moved utils to use new `src/shared/utils` paths and update tests to local `./` imports or `__tests__` relative paths.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/shared/utils/calculateKDRatio.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared/utils

git commit -m "refactor(shared): move utils and colocate tests"
```

### Task 3: Move shared consts/types and update build config

**Files:**
- Move: `src/consts/gameTypesArray.ts` → `src/shared/consts/gameTypesArray.ts`
- Move: `src/types/types.d.ts` → `src/shared/types/types.d.ts`
- Move: `src/types/statistics.d.ts` → `src/shared/types/statistics.d.ts`
- Move: `src/types/output.d.ts` → `src/shared/types/output.d.ts`
- Move: `src/types/replay.d.ts` → `src/shared/types/replay.d.ts`
- Create: `src/shared/types/types.test.ts`
- Modify: `tsconfig.json` (update `typeRoots` and add `baseUrl` if needed)
- Modify: `tsconfig.build.json` (exclude `**/*.test.ts` and `**/__tests__/**`)

**Step 1: Write the failing test**

```ts
test('global type roots are available', () => {
  const value: GlobalPlayerStatistics | null = null;
  expect(value).toBeNull();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/shared/types/types.test.ts`
Expected: FAIL with "Cannot find name 'GlobalPlayerStatistics'"

**Step 3: Write minimal implementation**

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "src/shared/types"]
  }
}
```

Update `tsconfig.build.json`:

```json
{
  "exclude": [
    "src/!tests",
    "**/*.test.ts",
    "**/__tests__/**"
  ]
}
```

Move the `.d.ts` files into `src/shared/types/` as listed above.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/shared/types/types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tsconfig.json tsconfig.build.json src/shared/consts src/shared/types

git commit -m "refactor(shared): move consts/types and update build config"
```

### Task 4: Create `modules/replays`

**Files:**
- Create: `src/modules/replays/index.ts`
- Move: `src/1 - replays/getReplays.ts` → `src/modules/replays/getReplays.ts`
- Move: `src/1 - replays/parseReplays.ts` → `src/modules/replays/parseReplays.ts`
- Move tests: `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/getReplays.test.ts` → `src/modules/replays/getReplays.test.ts`
- Move tests: `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/parseReplays.test.ts` → `src/modules/replays/parseReplays.test.ts`

**Step 1: Write the failing test**

```ts
import getReplays from './getReplays';

test('getReplays returns list of replays', async () => {
  const replays = await getReplays();
  expect(Array.isArray(replays)).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/modules/replays/getReplays.test.ts`
Expected: FAIL with "Cannot find module './getReplays'"

**Step 3: Write minimal implementation**

Create `src/modules/replays/index.ts`:

```ts
export { default as getReplays } from './getReplays';
export { default as parseReplays } from './parseReplays';
```

Move files and update internal imports to use `src/shared/*` paths.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/modules/replays/getReplays.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/replays

git commit -m "refactor(modules): move replays module"
```

### Task 5: Create `modules/parsing`

**Files:**
- Create: `src/modules/parsing/index.ts`
- Move: `src/2 - parseReplayInfo/combineSamePlayersInfo.ts` → `src/modules/parsing/combineSamePlayersInfo.ts`
- Move: `src/2 - parseReplayInfo/getEntities.ts` → `src/modules/parsing/getEntities.ts`
- Move: `src/2 - parseReplayInfo/getKillsAndDeaths.ts` → `src/modules/parsing/getKillsAndDeaths.ts`
- Move: `src/2 - parseReplayInfo/index.ts` → `src/modules/parsing/index.ts`
- Move tests: `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/combineSamePlayers.test.ts` → `src/modules/parsing/combineSamePlayersInfo.test.ts`

**Step 1: Write the failing test**

```ts
import combineSamePlayersInfo from './combineSamePlayersInfo';

test('combineSamePlayersInfo merges stats for same player', () => {
  const result = combineSamePlayersInfo([
    { id: '1', name: 'Foo', count: 1 },
    { id: '1', name: 'Foo', count: 2 },
  ] as OtherPlayer[]);

  expect(result[0].count).toBe(3);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/modules/parsing/combineSamePlayersInfo.test.ts`
Expected: FAIL with "Cannot find module './combineSamePlayersInfo'"

**Step 3: Write minimal implementation**

Create `src/modules/parsing/index.ts` exports:

```ts
export { default as combineSamePlayersInfo } from './combineSamePlayersInfo';
export { default as getEntities } from './getEntities';
export { default as getKillsAndDeaths } from './getKillsAndDeaths';
```

Move files and update internal imports to use `src/shared/*` and `src/modules/*` paths.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/modules/parsing/combineSamePlayersInfo.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/parsing

git commit -m "refactor(modules): move parsing module"
```

### Task 6: Create `modules/statistics`

**Files:**
- Create: `src/modules/statistics/index.ts`
- Move: `src/3 - statistics/global/add.ts` → `src/modules/statistics/global/add.ts`
- Move: `src/3 - statistics/global/addToResultsByWeek.ts` → `src/modules/statistics/global/addToResultsByWeek.ts`
- Move: `src/3 - statistics/global/index.ts` → `src/modules/statistics/global/index.ts`
- Move: `src/3 - statistics/rotations/getReplaysGroupByRotation.ts` → `src/modules/statistics/rotations/getReplaysGroupByRotation.ts`
- Move: `src/3 - statistics/rotations/index.ts` → `src/modules/statistics/rotations/index.ts`
- Move: `src/3 - statistics/squads/getSquadInfo.ts` → `src/modules/statistics/squads/getSquadInfo.ts`
- Move: `src/3 - statistics/squads/index.ts` → `src/modules/statistics/squads/index.ts`
- Move tests: `src/!tests/unit-tests/3 - statistics/calculateByRotations.test.ts` → `src/modules/statistics/rotations/calculateByRotations.test.ts`
- Move tests: `src/!tests/unit-tests/3 - statistics/calculateDeaths.test.ts` → `src/modules/statistics/global/calculateDeaths.test.ts`
- Move tests: `src/!tests/unit-tests/3 - statistics/calculateGlobalStatistics.test.ts` → `src/modules/statistics/global/calculateGlobalStatistics.test.ts`
- Move tests: `src/!tests/unit-tests/3 - statistics/calculateGlobalStatisticsWithNameChanges.test.ts` → `src/modules/statistics/global/calculateGlobalStatisticsWithNameChanges.test.ts`
- Move tests: `src/!tests/unit-tests/3 - statistics/calculateSquadStatistics.test.ts` → `src/modules/statistics/squads/calculateSquadStatistics.test.ts`
- Move tests: `src/!tests/unit-tests/3 - statistics/calculateSquadsStatisticsWithNameChanges.test.ts` → `src/modules/statistics/squads/calculateSquadsStatisticsWithNameChanges.test.ts`
- Move test data: `src/!tests/unit-tests/3 - statistics/data/forGlobalStatisticsWithNameChanges.ts` → `src/modules/statistics/global/__tests__/data/forGlobalStatisticsWithNameChanges.ts`
- Move snapshots: `src/!tests/unit-tests/3 - statistics/__snapshots__/*` → `src/modules/statistics/global/__tests__/__snapshots__/*`

**Step 1: Write the failing test**

```ts
import calculateGlobalStatistics from './calculateGlobalStatistics';

it('Global statistics calculation', () => {
  const result = calculateGlobalStatistics([]);
  expect(result).toEqual([]);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/modules/statistics/global/calculateGlobalStatistics.test.ts`
Expected: FAIL with "Cannot find module './calculateGlobalStatistics'"

**Step 3: Write minimal implementation**

Create `src/modules/statistics/index.ts`:

```ts
export * as global from './global';
export * as rotations from './rotations';
export * as squads from './squads';
```

Move files and update imports to use `src/shared/*` and `src/modules/*` paths.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/modules/statistics/global/calculateGlobalStatistics.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/statistics

git commit -m "refactor(modules): move statistics module"
```

### Task 7: Create `modules/output`

**Files:**
- Create: `src/modules/output/index.ts`
- Create: `src/modules/output/consts.test.ts`
- Move: `src/4 - output/archiveFiles.ts` → `src/modules/output/archiveFiles.ts`
- Move: `src/4 - output/consts.ts` → `src/modules/output/consts.ts`
- Move: `src/4 - output/index.ts` → `src/modules/output/index.ts`
- Move: `src/4 - output/json.ts` → `src/modules/output/json.ts`
- Move: `src/4 - output/rotationsJSON.ts` → `src/modules/output/rotationsJSON.ts`

**Step 1: Write the failing test**

```ts
import { globalStatsFileName } from './consts';

test('globalStatsFileName constant', () => {
  expect(globalStatsFileName).toBe('global_statistics.json');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/modules/output/consts.test.ts`
Expected: FAIL with "Cannot find module './consts'"

**Step 3: Write minimal implementation**

Create `src/modules/output/index.ts` exports:

```ts
export * from './consts';
export { default as archiveFiles } from './archiveFiles';
export { default as outputJSON } from './json';
export { default as rotationsJSON } from './rotationsJSON';
```

Move files and update imports to use `src/shared/*` and `src/modules/*` paths.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/modules/output/consts.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/output

git commit -m "refactor(modules): move output module"
```

### Task 8: Create `modules/yearStatistics` + entrypoint

**Files:**
- Create: `src/modules/yearStatistics/index.ts`
- Create: `src/modules/yearStatistics/utils/limitAndOrder.test.ts`
- Create: `src/jobs/yearStatistics.ts`
- Move: `src/!yearStatistics/index.ts` → `src/modules/yearStatistics/index.ts`
- Move: `src/!yearStatistics/processRawReplays.ts` → `src/modules/yearStatistics/processRawReplays.ts`
- Move: `src/!yearStatistics/utils/types.d.ts` → `src/modules/yearStatistics/utils/types.d.ts`
- Move: `src/!yearStatistics/utils/calculateDistance.ts` → `src/modules/yearStatistics/utils/calculateDistance.ts`
- Move: `src/!yearStatistics/utils/printText.ts` → `src/modules/yearStatistics/utils/printText.ts`
- Move: `src/!yearStatistics/utils/formatTime.ts` → `src/modules/yearStatistics/utils/formatTime.ts`
- Move: `src/!yearStatistics/utils/getPlayerNameAtEndOfTheYear.ts` → `src/modules/yearStatistics/utils/getPlayerNameAtEndOfTheYear.ts`
- Move: `src/!yearStatistics/utils/limitAndOrder.ts` → `src/modules/yearStatistics/utils/limitAndOrder.ts`
- Move: `src/!yearStatistics/utils/nominations.md` → `src/modules/yearStatistics/utils/nominations.md`
- Move: `src/!yearStatistics/utils/getPlayerVehicleClass.ts` → `src/modules/yearStatistics/utils/getPlayerVehicleClass.ts`
- Move: `src/!yearStatistics/utils/consts.ts` → `src/modules/yearStatistics/utils/consts.ts`
- Move: `src/!yearStatistics/nominations/mostPopularMissionMaker.ts` → `src/modules/yearStatistics/nominations/mostPopularMissionMaker.ts`
- Move: `src/!yearStatistics/nominations/mostKillsFromMedicSlot.ts` → `src/modules/yearStatistics/nominations/mostKillsFromMedicSlot.ts`
- Move: `src/!yearStatistics/nominations/mostHeight.ts` → `src/modules/yearStatistics/nominations/mostHeight.ts`
- Move: `src/!yearStatistics/nominations/mostDistantKill.ts` → `src/modules/yearStatistics/nominations/mostDistantKill.ts`
- Move: `src/!yearStatistics/nominations/mostFrequentTL.ts` → `src/modules/yearStatistics/nominations/mostFrequentTL.ts`
- Move: `src/!yearStatistics/nominations/mostTime.ts` → `src/modules/yearStatistics/nominations/mostTime.ts`
- Move: `src/!yearStatistics/nominations/mostPlaneKillsFromPlane.ts` → `src/modules/yearStatistics/nominations/mostPlaneKillsFromPlane.ts`
- Move: `src/!yearStatistics/nominations/mostKillsFromOldWeapons/index.ts` → `src/modules/yearStatistics/nominations/mostKillsFromOldWeapons/index.ts`
- Move: `src/!yearStatistics/nominations/mostKillsFromOldWeapons/oldWeapons.ts` → `src/modules/yearStatistics/nominations/mostKillsFromOldWeapons/oldWeapons.ts`
- Move: `src/!yearStatistics/nominations/mostDistance.ts` → `src/modules/yearStatistics/nominations/mostDistance.ts`
- Move: `src/!yearStatistics/nominations/mostFrequentCS.ts` → `src/modules/yearStatistics/nominations/mostFrequentCS.ts`
- Move: `src/!yearStatistics/nominations/mostKillsFromCommanderSlot.ts` → `src/modules/yearStatistics/nominations/mostKillsFromCommanderSlot.ts`
- Move: `src/!yearStatistics/nominations/mostTeamkills.ts` → `src/modules/yearStatistics/nominations/mostTeamkills.ts`
- Move: `src/!yearStatistics/nominations/deathToGamesRatio.ts` → `src/modules/yearStatistics/nominations/deathToGamesRatio.ts`
- Move: `src/!yearStatistics/nominations/mostAAKills.ts` → `src/modules/yearStatistics/nominations/mostAAKills.ts`
- Move: `src/!yearStatistics/nominations/mostPopularMission.ts` → `src/modules/yearStatistics/nominations/mostPopularMission.ts`
- Move: `src/!yearStatistics/nominations/mostDisconnects.ts` → `src/modules/yearStatistics/nominations/mostDisconnects.ts`
- Move: `src/!yearStatistics/nominations/mostATKills.ts` → `src/modules/yearStatistics/nominations/mostATKills.ts`
- Move: `src/!yearStatistics/nominations/bestRandomshik.ts` → `src/modules/yearStatistics/nominations/bestRandomshik.ts`
- Move: `src/!yearStatistics/nominations/mostTeamkillsInOneGame.ts` → `src/modules/yearStatistics/nominations/mostTeamkillsInOneGame.ts`
- Move: `src/!yearStatistics/nominations/mostKillsWithSmallWalkedDistance.ts` → `src/modules/yearStatistics/nominations/mostKillsWithSmallWalkedDistance.ts`
- Move: `src/!yearStatistics/nominations/mostShots.ts` → `src/modules/yearStatistics/nominations/mostShots.ts`
- Move: `src/!yearStatistics/nominations/bestWeaponAndVehicle.ts` → `src/modules/yearStatistics/nominations/bestWeaponAndVehicle.ts`
- Move: `src/!yearStatistics/nominations/mostDeathsFromTeamkills.ts` → `src/modules/yearStatistics/nominations/mostDeathsFromTeamkills.ts`
- Move: `src/!yearStatistics/nominations/mostKillsInCQB.ts` → `src/modules/yearStatistics/nominations/mostKillsInCQB.ts`
- Move: `src/!yearStatistics/output/index.ts` → `src/modules/yearStatistics/output/index.ts`
- Move: `src/!yearStatistics/output/formattersList.ts` → `src/modules/yearStatistics/output/formattersList.ts`
- Move: `src/!yearStatistics/output/formatters/mostPopularMissionMaker.ts` → `src/modules/yearStatistics/output/formatters/mostPopularMissionMaker.ts`
- Move: `src/!yearStatistics/output/formatters/mostKillsFromMedicSlot.ts` → `src/modules/yearStatistics/output/formatters/mostKillsFromMedicSlot.ts`
- Move: `src/!yearStatistics/output/formatters/bestVehicle.ts` → `src/modules/yearStatistics/output/formatters/bestVehicle.ts`
- Move: `src/!yearStatistics/output/formatters/mostDistantKill.ts` → `src/modules/yearStatistics/output/formatters/mostDistantKill.ts`
- Move: `src/!yearStatistics/output/formatters/mostFrequentTL.ts` → `src/modules/yearStatistics/output/formatters/mostFrequentTL.ts`
- Move: `src/!yearStatistics/output/formatters/mostKillsFromOldWeapons.ts` → `src/modules/yearStatistics/output/formatters/mostKillsFromOldWeapons.ts`
- Move: `src/!yearStatistics/output/formatters/mostHeightPlane.ts` → `src/modules/yearStatistics/output/formatters/mostHeightPlane.ts`
- Move: `src/!yearStatistics/output/formatters/mostPlaneKillsFromPlane.ts` → `src/modules/yearStatistics/output/formatters/mostPlaneKillsFromPlane.ts`
- Move: `src/!yearStatistics/output/formatters/mostWalkedDistance.ts` → `src/modules/yearStatistics/output/formatters/mostWalkedDistance.ts`
- Move: `src/!yearStatistics/output/formatters/bestWeapon.ts` → `src/modules/yearStatistics/output/formatters/bestWeapon.ts`
- Move: `src/!yearStatistics/output/formatters/mostTimeAlive.ts` → `src/modules/yearStatistics/output/formatters/mostTimeAlive.ts`
- Move: `src/!yearStatistics/output/formatters/mostTimeInVehicle.ts` → `src/modules/yearStatistics/output/formatters/mostTimeInVehicle.ts`
- Move: `src/!yearStatistics/output/formatters/mostTimeInFlyingVehicle.ts` → `src/modules/yearStatistics/output/formatters/mostTimeInFlyingVehicle.ts`
- Move: `src/!yearStatistics/output/formatters/mostDistanceInVehicle.ts` → `src/modules/yearStatistics/output/formatters/mostDistanceInVehicle.ts`
- Move: `src/!yearStatistics/output/formatters/mostFrequentCS.ts` → `src/modules/yearStatistics/output/formatters/mostFrequentCS.ts`
- Move: `src/!yearStatistics/output/formatters/mostKillsFromCommanderSlot.ts` → `src/modules/yearStatistics/output/formatters/mostKillsFromCommanderSlot.ts`
- Move: `src/!yearStatistics/output/formatters/mostTeamkills.ts` → `src/modules/yearStatistics/output/formatters/mostTeamkills.ts`
- Move: `src/!yearStatistics/output/formatters/mostAAKills.ts` → `src/modules/yearStatistics/output/formatters/mostAAKills.ts`
- Move: `src/!yearStatistics/output/formatters/worstDeathToGamesRatio.ts` → `src/modules/yearStatistics/output/formatters/worstDeathToGamesRatio.ts`
- Move: `src/!yearStatistics/output/formatters/mostPopularMission.ts` → `src/modules/yearStatistics/output/formatters/mostPopularMission.ts`
- Move: `src/!yearStatistics/output/formatters/bestDeathToGamesRatio.ts` → `src/modules/yearStatistics/output/formatters/bestDeathToGamesRatio.ts`
- Move: `src/!yearStatistics/output/formatters/mostDisconnects.ts` → `src/modules/yearStatistics/output/formatters/mostDisconnects.ts`
- Move: `src/!yearStatistics/output/formatters/mostTimeWalked.ts` → `src/modules/yearStatistics/output/formatters/mostTimeWalked.ts`
- Move: `src/!yearStatistics/output/formatters/mostATKills.ts` → `src/modules/yearStatistics/output/formatters/mostATKills.ts`
- Move: `src/!yearStatistics/output/formatters/mostTeamkillsInOneGame.ts` → `src/modules/yearStatistics/output/formatters/mostTeamkillsInOneGame.ts`
- Move: `src/!yearStatistics/output/formatters/mostHeightHeli.ts` → `src/modules/yearStatistics/output/formatters/mostHeightHeli.ts`
- Move: `src/!yearStatistics/output/formatters/mostKillsWithSmallWalkedDistance.ts` → `src/modules/yearStatistics/output/formatters/mostKillsWithSmallWalkedDistance.ts`
- Move: `src/!yearStatistics/output/formatters/mostShots.ts` → `src/modules/yearStatistics/output/formatters/mostShots.ts`
- Move: `src/!yearStatistics/output/formatters/mostTimeInGroundVehicle.ts` → `src/modules/yearStatistics/output/formatters/mostTimeInGroundVehicle.ts`
- Move: `src/!yearStatistics/output/formatters/mostDeathsFromTeamkills.ts` → `src/modules/yearStatistics/output/formatters/mostDeathsFromTeamkills.ts`
- Move: `src/!yearStatistics/output/formatters/mostKillsInCQB.ts` → `src/modules/yearStatistics/output/formatters/mostKillsInCQB.ts`
- Modify: `package.json` (update `parse-new-year` and `parse-new-year-dev` to `dist/jobs/yearStatistics.js`)
- Modify: `src/services/yearStatistics/*` (either remove or turn into thin wrappers over `src/modules/yearStatistics`)

**Step 1: Write the failing test**

```ts
import limitAndOrder from './limitAndOrder';

test('limitAndOrder sorts and limits', () => {
  const list = [{ count: 1 }, { count: 3 }, { count: 2 }];
  const result = limitAndOrder(list, ['count'], ['desc'], 2);
  expect(result.map((item) => item.count)).toEqual([3, 2]);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/modules/yearStatistics/utils/limitAndOrder.test.ts`
Expected: FAIL with "Cannot find module './limitAndOrder'"

**Step 3: Write minimal implementation**

```ts
import { orderBy, take } from 'lodash';

import { maxRecords } from './consts';

const limitAndOrder = <ListType>(
  list: NomineeList<ListType> | ListType[],
  order: Parameters<typeof orderBy>[1],
  direction: Parameters<typeof orderBy>[2],
  maxValues: number = maxRecords,
): ListType[] => (
  take(orderBy(list, order, direction), maxValues)
);

export default limitAndOrder;
```

Move the remaining files as listed, and create `src/jobs/yearStatistics.ts` as the new entrypoint calling `modules/yearStatistics` (mirroring old `src/!yearStatistics/index.ts`).

**Step 4: Run test to verify it passes**

Run: `npm test -- src/modules/yearStatistics/utils/limitAndOrder.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/yearStatistics src/jobs/yearStatistics.ts package.json

git commit -m "refactor(modules): move year statistics module and entrypoint"
```

### Task 9: Align services/jobs to modules + move job tests

**Files:**
- Modify: `src/services/discovery/*` (import shared/utils/modules)
- Modify: `src/services/download/*`
- Modify: `src/services/parse/*`
- Modify: `src/services/statistics/*`
- Modify: `src/services/output/*`
- Modify: `src/jobs/pipeline/*.ts` (imports from services/modules)
- Modify: `src/jobs/prepareReplaysList/*`
- Modify: `src/jobs/generateMissionMakersList/*`
- Modify: `src/jobs/generateMaceListHTML/*`
- Move tests: `src/!tests/unit-tests/jobs/prepareReplaysList/getMissionName.test.ts` → `src/jobs/prepareReplaysList/getMissionName.test.ts`
- Move tests: `src/!tests/unit-tests/jobs/prepareReplaysList/parseReplaysOnPage.test.ts` → `src/jobs/prepareReplaysList/parseReplaysOnPage.test.ts`

**Step 1: Write the failing test**

```ts
import getMissionName from './getMissionName';

test('getMissionName returns readable name', () => {
  expect(getMissionName('co15_mission_name')).toContain('co15');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/jobs/prepareReplaysList/getMissionName.test.ts`
Expected: FAIL with "Cannot find module './getMissionName'" or unresolved shared imports

**Step 3: Write minimal implementation**

Update job imports to use the new module paths, for example:

```ts
import { getMissionName } from './utils/getMissionName';
import { dayjsUTC } from '../../shared/utils/dayjs';
```

Update all service-to-module imports to the new `src/modules/*` and `src/shared/*` locations, and update job entrypoints to call the appropriate services.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/jobs/prepareReplaysList/getMissionName.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services src/jobs

git commit -m "refactor: align services/jobs with modules"
```

### Task 10: Remove legacy directories and add guard test

**Files:**
- Create: `src/shared/testing/noLegacyPaths.test.ts`
- Remove: `src/0 - consts/`
- Remove: `src/0 - types/`
- Remove: `src/0 - utils/`
- Remove: `src/1 - replays/`
- Remove: `src/2 - parseReplayInfo/`
- Remove: `src/3 - statistics/`
- Remove: `src/4 - output/`
- Remove: `src/!tests/`
- Remove: `src/!yearStatistics/`
- Modify: `README.md` (update architecture overview and entrypoints)

**Step 1: Write the failing test**

```ts
import fs from 'fs';
import path from 'path';

const legacyPaths = [
  'src/0 - consts',
  'src/0 - types',
  'src/0 - utils',
  'src/1 - replays',
  'src/2 - parseReplayInfo',
  'src/3 - statistics',
  'src/4 - output',
  'src/!tests',
  'src/!yearStatistics',
];

test('legacy paths are removed', () => {
  const repoRoot = path.resolve(__dirname, '../../..');
  const existing = legacyPaths.filter((p) => fs.existsSync(path.join(repoRoot, p)));
  expect(existing).toEqual([]);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/shared/testing/noLegacyPaths.test.ts`
Expected: FAIL listing existing legacy paths

**Step 3: Write minimal implementation**

Delete the legacy directories listed above and update `README.md` to document the new structure and entrypoints (e.g., `npm run pipeline:full`, `npm run parse-new-year`).

**Step 4: Run test to verify it passes**

Run: `npm test -- src/shared/testing/noLegacyPaths.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared/testing/noLegacyPaths.test.ts README.md

git commit -m "chore: remove legacy structure and document new layout"
```
