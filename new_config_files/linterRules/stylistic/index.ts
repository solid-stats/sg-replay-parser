import JSXStylisticRules from './JSX';
import mainRules from './main';

const stylisticRules = {
  ...mainRules,
  ...JSXStylisticRules,
};

export default stylisticRules;
