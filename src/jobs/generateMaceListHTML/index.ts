import path from 'path';

import fs from 'fs-extra';
import { JSDOM } from 'jsdom';

import { dayjsUTC } from '../../0 - utils/dayjs';
import defaultDateFormat from '../generateMissionMakersList/utils/defaultDateFormat';
import generateBasicHTML from '../../0 - utils/generateBasicHTML';
import logger from '../../0 - utils/logger';
import { listsPath, replaysListPath } from '../../0 - utils/paths';
import body from './utils/body';

type MaceReplayItem = {
  name: string;
  map: string;
  date: string;
};

const readReplaysListFile = (): Output => {
  try {
    return JSON.parse(fs.readFileSync(replaysListPath, 'utf8'));
  } catch {
    throw new Error(`${replaysListPath} file doesn't exist or has invalid format`);
  }
};

const generateMaceList = () => {
  const html = generateBasicHTML('Список отыгранных MACE', body);
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const listElement = document.querySelector('#list');
  const replaysCountElement = document.querySelector('#total-replays');
  const updateDateElement = document.querySelector('#update-date');

  if (!listElement || !replaysCountElement || !updateDateElement) {
    throw new Error('Required elements is missing in basic html file');
  }

  const replaysList = readReplaysListFile();

  const maceReplays: MaceReplayItem[] = replaysList.replays
    .map((replay) => {
      const [gameType] = replay.mission_name.split('@');

      if (gameType !== 'mace') return null;

      return {
        name: replay.mission_name,
        map: replay.world_name,
        date: dayjsUTC(replay.date).format(defaultDateFormat),
      };
    })
    .filter(Boolean) as MaceReplayItem[];

  maceReplays.forEach((maceReplay) => {
    const listItem = document.createElement('li');

    const name = document.createElement('div');
    const map = document.createElement('div');
    const date = document.createElement('div');

    listItem.classList.add('item');

    name.classList.add('name');
    name.textContent = `Название: ${maceReplay.name}`;
    listItem.appendChild(name);

    map.classList.add('map');
    map.textContent = `Карта: ${maceReplay.map}`;
    listItem.appendChild(map);

    date.classList.add('date');
    date.textContent = `Дата: ${maceReplay.date}`;
    listItem.appendChild(date);

    listElement.appendChild(listItem);
  });

  const replaysCount = maceReplays.length;
  const dateNow = dayjsUTC().format(defaultDateFormat);

  replaysCountElement.textContent = replaysCount.toString();
  updateDateElement.textContent = dateNow;

  fs.writeFileSync(path.join(listsPath, 'mace_list.html'), dom.serialize());

  logger.info('Maces list created successfully.');
};

export default generateMaceList;
