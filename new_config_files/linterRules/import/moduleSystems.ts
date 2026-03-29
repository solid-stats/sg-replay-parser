import { Linter } from 'eslint';

// https://github.com/import-js/eslint-plugin-import?tab=readme-ov-file#module-systems
const moduleSystems: Linter.RulesRecord = {
  'import/no-amd': 2,
  'import/no-commonjs': 2,
  'import/no-import-module-exports': 2,
  'import/no-nodejs-modules': 0,
};

export default moduleSystems;
