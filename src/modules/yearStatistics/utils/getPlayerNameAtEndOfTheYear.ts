import { dayjsUTC } from '../../../shared/utils/dayjs';
import { isInInterval } from '../../../shared/utils/isInInterval';
import { getNamesList } from '../../../shared/utils/namesHelper';
import { dateFormat } from '../../../shared/utils/namesHelper/utils/consts';
import { year } from './consts';

const getPlayerNameAtEndOfTheYear = (id: string) => {
  const namesList = getNamesList();

  if (!namesList) return undefined;

  const namesListFilteredById = Object
    .values(namesList)
    .filter((nameInfo) => nameInfo.id === id);

  const endOfYearDate = dayjsUTC().year(year).endOf('year');
  let resultName = '';

  namesListFilteredById.forEach((info) => {
    if (
      isInInterval(
        endOfYearDate,
        dayjsUTC(info.fromDate, dateFormat),
        dayjsUTC(info.endDate, dateFormat),
        true,
      )
    ) resultName = info.name;
  });

  return resultName || undefined;
};

export default getPlayerNameAtEndOfTheYear;
