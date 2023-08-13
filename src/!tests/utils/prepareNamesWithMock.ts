import syncParse from 'csv-parse/sync';

import { prepareNamesList } from '../../0 - utils/namesHelper/prepareNamesList';

const prepareNamesWithMock = () => {
  jest.mock('csv-parse');
  jest.spyOn(syncParse, 'parse').mockReturnValueOnce([]);

  prepareNamesList();
};

export default prepareNamesWithMock;
