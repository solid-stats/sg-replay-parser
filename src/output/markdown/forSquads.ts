import fs from 'fs';

import markdownTable from 'markdown-table';

import getSquadPrefix from '../../utils/getSquadPrefix';
import { statsBySquadFolder, statsFolder } from '../consts';

const generateMarkdownTableForSquads = (statistics: StatisticsForOutput): void => {
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

const generateMarkdownTablesBySquad = (statistics: StatisticsForOutput): void => {
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

const generateMarkdownTables = (statistics: StatisticsForOutput) => {
  generateMarkdownTableForSquads(statistics);
  generateMarkdownTablesBySquad(statistics);
};

export default generateMarkdownTables;
