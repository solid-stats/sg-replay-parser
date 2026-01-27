import logger from '../../../shared/utils/logger';

export const printNominationProcessStart = (nominationTitle: string) => (
  logger.info(`Started data process for ${nominationTitle} nomination.`)
);

export const printFinish = () => {
  logger.info('Completed.');
};
