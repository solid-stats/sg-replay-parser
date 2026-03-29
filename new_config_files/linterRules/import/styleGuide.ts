import { Linter } from 'eslint';

// https://github.com/import-js/eslint-plugin-import?tab=readme-ov-file#static-analysis
const styleGuide: Linter.RulesRecord = {
  'import/consistent-type-specifier-style': [2, 'prefer-top-level'],
  'import/exports-last': 0,
  'import/extensions': [
    2,
    'never',
    {
      json: 'always',
      svg: 'always',
    },
  ],
  'import/first': 2,
  'import/group-exports': 0,
  'import/newline-after-import': 2,
  'import/no-anonymous-default-export': [
    2,
    {
      allowArray: false,
      allowArrowFunction: false,
      allowAnonymousClass: false,
      allowAnonymousFunction: false,
      allowCallExpression: true,
      allowNew: false,
      allowLiteral: false,
      allowObject: false,
    },
  ],
  'import/no-duplicates': [
    2,
    {
      'prefer-inline': false,
    },
  ],
  'import/no-namespace': 0,
  'import/no-unassigned-import': [
    2,
    {
      allow: ['**/*.css'],
    },
  ],
  'import/order': [
    2,
    {
      'newlines-between': 'always',
      pathGroups: [
        {
          pattern: 'react',
          group: 'builtin',
          position: 'before',
        },
        {
          pattern: 'React',
          group: 'builtin',
          position: 'before',
        },
      ],
      pathGroupsExcludedImportTypes: ['React', 'react'],
      groups: [
        'builtin',
        'external',
        'internal',
        'index',
        'object',
        'unknown',
        ['parent', 'sibling'],
      ],
      named: true,
      alphabetize: {
        order: 'asc',
        caseInsensitive: false,
      },
    },
  ],
};

export default styleGuide;
