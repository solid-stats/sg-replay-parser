import { NamesList } from './utils/types';

let namesList: NamesList | null = null;

export const getNamesList = (): NamesList | null => namesList;

export const setNamesList = (newList: NamesList) => { namesList = newList; };

export const resetNamesList = () => { namesList = null; };
