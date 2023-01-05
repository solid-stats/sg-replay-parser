/* eslint-disable no-console */
export const printNominationProcessStart = (nominationTitle: string) => (
  console.log(`Started data process for ${nominationTitle} nomination.`)
);

export const printFinish = (placeSpaceInTheEnd = true) => {
  console.log('Completed.');

  if (placeSpaceInTheEnd) console.log('');
};
