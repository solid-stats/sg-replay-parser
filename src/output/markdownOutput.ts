import fs from 'fs';

import { endOfWeek, startOfWeek, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import markdownTable from 'markdown-table';

import getSquadPrefix from '../utils/getSquadPrefix';
import { statsBySquadFolder, statsByWeeksFolder, statsFolder } from './consts';

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

export const generateMarkdownTableForSquads = (statistics: StatisticsForOutput): void => {
  const headers = [
    'Место',
    'Отряд',
    'Кол-во игроков',
    'Всего убийств',
    'Всего тимкиллов',
    'Общий счет',
  ];

  const result = markdownTable(
    [
      headers,
      ...statistics.squad.map((squadStats, index) => ([
        index + 1,
        getSquadPrefix(squadStats.prefix),
        String(squadStats.players.length),
        String(squadStats.kills),
        String(squadStats.teamkills),
        String(squadStats.score),
      ])),
    ],
    { align: ['c', 'l', 'r', 'r', 'r', 'r'] },
  );

  fs.writeFileSync(`${statsFolder}/squadStats.md`, result);
};

export const generateMarkdownTablesBySquad = (statistics: StatisticsForOutput): void => {
  const headers = [
    'Место',
    'Игрок',
    'Кол-во игр',
    'Убийств',
    'Тимкиллов',
    'Смертей',
    'K/D',
    'Счет',
  ];

  statistics.squad.forEach(({ prefix, players }) => {
    const result = markdownTable(
      [
        headers,
        ...players.map((stats, index) => ([
          index + 1,
          stats.playerName,
          String(stats.totalPlayedGames),
          String(stats.kills),
          String(stats.teamkills),
          String(stats.deaths),
          String(stats.kdRatio),
          String(stats.totalScore),
        ])),
      ],
      { algin: ['c', 'l', 'r', 'r', 'r', 'r', 'r', 'r'] },
    );

    fs.writeFileSync(`${statsBySquadFolder}/${getSquadPrefix(prefix)}.md`, result);
  });
};
