const generateNameChangeItem = (oldName: string, newName: string, date: string) => (
  {
    'Отметка времени': '28.07.2023 14:15:31',
    'Ссылка на профиль': 'https://solidgames.ru/profile/borigen',
    'Старый позывной': oldName,
    'Новый позывной': newName,
    Дата: date,
    Статус: 'Принято',
    'Причина отказа': '',
  }
);

export default generateNameChangeItem;
