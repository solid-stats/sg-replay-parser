import { Linter } from 'eslint';

// https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
const reactHooksRules: Linter.RulesRecord = {
  'react-hooks/rules-of-hooks': 2,
  'react-hooks/exhaustive-deps': 2,
};

export default reactHooksRules;
