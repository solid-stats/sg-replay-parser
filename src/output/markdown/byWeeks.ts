import fs from 'fs';

import { endOfWeek, startOfWeek, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import markdownTable from 'markdown-table';

import { statsByWeeksFolder } from '../consts';

const dateFormat = 'dd MMM yyyy';
const formatDate = (date: Date) => format(date, dateFormat, { locale: ru });

const generateMarkdownTablesByWeek = (statistics: StatisticsForOutput): void => {
  const headers = [
    'Даты',
    'Кол-во игр',
    'Убийств',
    'Тимкиллов',
    'Смертей',
    'K/D',
    'Счет',
  ];

  statistics.global.forEach(({ playerName, byWeeks }) => {
    const result = markdownTable(
      [
        headers,
        ...byWeeks.map((stats) => ([
          `${formatDate(startOfWeek(stats.date, { weekStartsOn: 1 }))} - ${formatDate(endOfWeek(stats.date, { weekStartsOn: 1 }))}`,
          String(stats.totalPlayedGames),
          String(stats.kills),
          String(stats.teamkills),
          String(stats.deaths),
          String(stats.kdRatio),
          String(stats.score),
        ])),
      ],
      { align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'] },
    );

    fs.writeFileSync(`${statsByWeeksFolder}/${playerName}.md`, result);
  });
};

export default generateMarkdownTablesByWeek;
