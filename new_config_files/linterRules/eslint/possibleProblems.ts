import { Linter } from 'eslint';

// https://eslint.org/docs/latest/rules/#possible-problems
const possibleProblems: Linter.RulesRecord = {
  'array-callback-return': [
    2,
    {
      allowImplicit: true,
      checkForEach: true,
      allowVoid: true,
    },
  ],
  'for-direction': 2,
  'no-async-promise-executor': 2,
  'no-await-in-loop': 2,
  'no-compare-neg-zero': 2,
  'no-cond-assign': [2, 'always'],
  'no-constant-binary-expression': 2,
  'no-constant-condition': [2, { checkLoops: 'all' }],
  'no-constructor-return': 2,
  'no-control-regex': 2,
  'no-debugger': 2,
  'no-dupe-else-if': 2,
  'no-duplicate-imports': 0,
  'no-empty-character-class': 2,
  'no-empty-pattern': [2, { allowObjectPatternsAsParameters: false }],
  'no-ex-assign': 2,
  'no-fallthrough': [
    2,
    {
      commentPattern: '',
      allowEmptyCase: true,
      reportUnusedFallthroughComment: true,
    },
  ],
  'no-import-assign': 2,
  'no-inner-declarations': [2, 'both'],
  'no-invalid-regexp': 2,
  'no-irregular-whitespace': [
    2,
    {
      skipStrings: true,
      skipComments: false,
      skipRegExps: false,
      skipTemplates: false,
      skipJSXText: false,
    },
  ],
  'no-loss-of-precision': 2,
  'no-misleading-character-class': [2, { allowEscape: false }],
  'no-new-native-nonconstructor': 2,
  'no-promise-executor-return': [2, { allowVoid: false }],
  'no-prototype-builtins': 2,
  'no-self-assign': [2, { props: true }],
  'no-self-compare': 2,
  'no-sparse-arrays': 2,
  'no-template-curly-in-string': 2,
  'no-unexpected-multiline': 2,
  'no-unmodified-loop-condition': 2,
  'no-unreachable': 2,
  'no-unreachable-loop': 2,
  'no-unsafe-finally': 2,
  'no-unsafe-optional-chaining': [2, { disallowArithmeticOperators: true }],
  'no-unused-private-class-members': 2,
  // Replaced with ts/no-use-before-define
  'no-use-before-define': 0,
  'no-useless-assignment': 2,
  'no-useless-backreference': 2,
  'require-atomic-updates': [2, { allowProperties: false }],
  'use-isnan': [
    2,
    {
      enforceForSwitchCase: true,
      enforceForIndexOf: true,
    },
  ],
  'valid-typeof': [2, { requireStringLiterals: true }],
};

export default possibleProblems;
