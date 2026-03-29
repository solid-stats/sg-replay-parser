import { Linter } from 'eslint';

// https://github.com/import-js/eslint-plugin-import?tab=readme-ov-file#helpful-warnings
const helpfulWarnings: Linter.RulesRecord = {
  'import/export': 2,
  'import/no-deprecated': 2,
  'import/no-empty-named-blocks': 2,
  'import/no-extraneous-dependencies': [
    2,
    {
      devDependencies: true,
      optionalDependencies: false,
      peerDependencies: false,
      bundledDependencies: false,
    },
  ],
  'import/no-mutable-exports': 2,
  // Disabled because do not work with styled-components import
  'import/no-named-as-default': 0,
  'import/no-named-as-default-member': 0,
  // Disabled because do not work with styled-components import
  'import/no-unused-modules': [
    2,
    {
      unusedExports: true,
      missingExports: false,
      ignoreUnusedTypeExports: false,
    },
  ],
};

export default helpfulWarnings;
