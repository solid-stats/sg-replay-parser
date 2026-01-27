import path from 'path';

import fs from 'fs-extra';
import { JSDOM } from 'jsdom';

import { dayjsUTC } from '../../shared/utils/dayjs';
import generateBasicHTML from '../../shared/utils/generateBasicHTML';
import logger from '../../shared/utils/logger';
import { listsPath } from '../../shared/utils/paths';
import body from './utils/body';
import defaultDateFormat from './utils/defaultDateFormat';
import fetchTeamPage from './utils/requestTeamPage';

const findMissionMakers = (sectionHeaders: NodeListOf<Element>, sectionHeaderText: string) => {
  const sectionHeader = Array.from(sectionHeaders)
    .find((header) => header.textContent?.includes(sectionHeaderText));

  if (!sectionHeader) throw new Error('Map makers section header is not found');

  const missionMakers = sectionHeader.parentElement?.querySelectorAll('.row');

  if (!missionMakers) throw new Error('Mission makers list is not found');

  return Array.from(missionMakers)
    .map((item) => item.querySelector('.forum-user > a:nth-child(2)')?.textContent ?? '')
    .filter(Boolean);
};

const generateMissionMakersList = async () => {
  const teamPageHTML = await fetchTeamPage();
  const pageDOM = new JSDOM(teamPageHTML);
  const { document: pageDocument } = pageDOM.window;

  const resultHTML = generateBasicHTML('Список картоделов', body);
  const resultDOM = new JSDOM(resultHTML);
  const { document: resultDocument } = resultDOM.window;

  const sectionHeaders = pageDocument.querySelectorAll('.section-header');

  if (sectionHeaders.length === 0) throw new Error('No section headers found');

  const missionMakers = findMissionMakers(sectionHeaders, 'Mission Makers');
  const juniorMissionMakers = findMissionMakers(sectionHeaders, 'Junior Mission Makers');

  const missionMakersListElement = resultDocument.querySelector('#mission-makers-list');
  const juniorMissionMakersListElement = resultDocument.querySelector('#junior-mission-makers-list');
  const updateDateElement = resultDocument.querySelector('#update-date');

  if (!missionMakersListElement || !juniorMissionMakersListElement || !updateDateElement) {
    throw new Error('Required elements is missing in basic html file');
  }

  missionMakers.forEach((item) => {
    const listItem = resultDocument.createElement('li');

    const name = resultDocument.createElement('div');

    listItem.classList.add('item');

    name.classList.add('name');
    name.textContent = item;
    listItem.appendChild(name);

    missionMakersListElement.appendChild(listItem);
  });

  juniorMissionMakers.forEach((item) => {
    const listItem = resultDocument.createElement('li');

    const name = resultDocument.createElement('div');

    listItem.classList.add('item');

    name.classList.add('name');
    name.textContent = item;
    listItem.appendChild(name);

    juniorMissionMakersListElement.appendChild(listItem);
  });

  const dateNow = dayjsUTC().format(defaultDateFormat);

  updateDateElement.textContent = dateNow;

  fs.writeFileSync(path.join(listsPath, 'mission_makers_list.html'), resultDOM.serialize());

  logger.info('Mission makers fetching finished.');
};

export default generateMissionMakersList;
