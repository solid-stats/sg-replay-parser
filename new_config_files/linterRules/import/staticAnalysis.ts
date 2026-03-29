import { Linter } from 'eslint';

// https://github.com/import-js/eslint-plugin-import?tab=readme-ov-file#static-analysis
const staticAnalysis: Linter.RulesRecord = {
  'import/default': 2,
  'import/no-absolute-path': 2,
  'import/no-cycle': 2,
  'import/no-relative-packages': 2,
  'import/no-self-import': 2,
  'import/no-unresolved': 2,
  'import/no-useless-path-segments': [2, { noUselessIndex: true }],
};

export default staticAnalysis;
