import round from 'lodash/round';

const calculateKDRatio = (
  kills: GlobalPlayerStatistics['kills'],
  deaths: GlobalPlayerStatistics['deaths'],
): GlobalPlayerStatistics['kdRatio'] => (deaths === 0 ? kills : round(kills / deaths, 2));

export default calculateKDRatio;
