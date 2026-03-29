import helpfulWarnings from './helpfulWarning';
import moduleSystems from './moduleSystems';
import staticAnalysis from './staticAnalysis';
import styleGuide from './styleGuide';

const importRules = {
  ...helpfulWarnings,
  ...moduleSystems,
  ...staticAnalysis,
  ...styleGuide,
};

export default importRules;
