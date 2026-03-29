import possibleProblems from './possibleProblems';
import suggestions from './suggestions';

const eslintRules = {
  ...possibleProblems,
  ...suggestions,
};

export default eslintRules;
