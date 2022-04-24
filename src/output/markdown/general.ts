import fs from 'fs';

import markdownTable from 'markdown-table';

import { statsFolder } from '../consts';

const generateGeneralMarkdownTable = (statistics: StatisticsForOutput): void => {
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

export default generateGeneralMarkdownTable;
