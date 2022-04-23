import fs from 'fs';

import { endOfWeek, startOfWeek, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import markdownTable from 'markdown-table';

import { statsByWeeksFolder, statsFolder } from './consts';

export const generateMarkdownTable = (statistics: StatisticsForOutput): void => {
  const headers = [
    'Место',
    'Отряд',
    'Игрок',
    'Кол-во игр',
    'Убийств',
    'Тимкиллов',
    'Смертей',
    'K/D',
    'Счет',
  ];

  const result = markdownTable(
    [
      headers,
      ...statistics.global.map((stats, index) => ([
        index + 1,
        stats.lastSquadPrefix,
        stats.playerName,
        String(stats.totalPlayedGames),
        String(stats.kills),
        String(stats.teamkills),
        String(stats.deaths),
        String(stats.kdRatio),
        String(stats.totalScore),
      ])),
    ],
    { align: ['c', 'l', 'l', 'r', 'r', 'r', 'r', 'r', 'r'] },
  );

  fs.writeFileSync(`${statsFolder}/stats.md`, result);
};

const dateFormat = 'dd MMM yyyy';
const formatDate = (date: Date) => format(date, dateFormat, { locale: ru });

export const generateMarkdownTablesByWeek = (statistics: StatisticsForOutput): void => {
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
          `${formatDate(startOfWeek(stats.date))} - ${formatDate(endOfWeek(stats.date))}`,
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
