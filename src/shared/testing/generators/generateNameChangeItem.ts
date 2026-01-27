import { RawCSVContentType } from '../../utils/namesHelper/prepareNamesList';

const generateNameChangeItem = (
  oldName: string,
  newName: string,
  date: string,
): RawCSVContentType => (
  {
    'Старый позывной': oldName,
    'Новый позывной': newName,
    'Дата смены ника': date,
    Статус: 'Принято',
  }
);

export default generateNameChangeItem;
