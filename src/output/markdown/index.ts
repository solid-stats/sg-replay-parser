import generateMarkdownTablesByWeek from './byWeeks';
import generateMarkdownTablesForSquads from './forSquads';
import generateGeneralMarkdownTable from './general';

const generateMarkdownOutput = (statistics: StatisticsForOutput): void => {
  generateGeneralMarkdownTable(statistics);
  generateMarkdownTablesByWeek(statistics);
  generateMarkdownTablesForSquads(statistics);
};

export default generateMarkdownOutput;
