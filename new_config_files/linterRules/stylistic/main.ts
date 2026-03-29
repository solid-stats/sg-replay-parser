/* eslint-disable max-lines */
import { Linter } from 'eslint';

// https://eslint.style/rules
const mainStylisticRules: Linter.RulesRecord = {
// Do not forget to also change "@stylistic/array-element-newline" rule
  '@stylistic/array-bracket-newline': [2, { multiline: true }],
  '@stylistic/array-bracket-spacing': 2,
  // Do not forget to also change "@stylistic/array-bracket-newline" rule
  '@stylistic/array-element-newline': [
    2,
    { multiline: true, consistent: true },
  ],
  '@stylistic/arrow-parens': [2, 'always'],
  '@stylistic/arrow-spacing': 2,
  '@stylistic/block-spacing': 2,
  '@stylistic/brace-style': [2, '1tbs', { allowSingleLine: true }],
  '@stylistic/comma-dangle': [2, 'always-multiline'],
  '@stylistic/comma-spacing': 2,
  '@stylistic/comma-style': [2, 'last'],
  '@stylistic/computed-property-spacing': [2, 'never'],
  '@stylistic/curly-newline': [
    0,
    {
      multiline: true,
      minElements: 2,
    },
  ],
  '@stylistic/dot-location': [2, 'property'],
  '@stylistic/eol-last': [2, 'always'],
  '@stylistic/function-call-spacing': 2,
  '@stylistic/function-paren-newline': [2, 'consistent'],
  '@stylistic/generator-star-spacing': [2, 'after'],
  '@stylistic/implicit-arrow-linebreak': [2, 'beside'],
  '@stylistic/indent': [2, 2],
  '@stylistic/indent-binary-ops': [2, 2],
  '@stylistic/key-spacing': [
    2,
    {
      beforeColon: false,
      afterColon: true,
      mode: 'strict',
    },
  ],
  '@stylistic/line-comment-position': [2, 'above'],
  '@stylistic/linebreak-style': [2, 'unix'],
  '@stylistic/lines-around-comment': [
    0,
    {
      beforeBlockComment: true,
      afterBlockComment: false,

      allowBlockStart: true,
      allowBlockEnd: true,

      allowObjectStart: true,
      allowObjectEnd: true,

      allowArrayStart: true,
      allowArrayEnd: true,

      allowClassStart: true,
      allowClassEnd: true,

      allowEnumStart: true,
      allowEnumEnd: true,

      allowInterfaceStart: true,
      allowInterfaceEnd: true,

      allowModuleStart: true,
      allowModuleEnd: true,

      allowTypeStart: true,
      allowTypeEnd: true,
    },
  ],
  '@stylistic/lines-between-class-members': 2,
  '@stylistic/max-len': [
    2,
    {
      code: 80,
      ignoreUrls: true,
      ignoreStrings: false,
      ignoreTemplateLiterals: false,
      ignoreRegExpLiterals: true,
      // Ignore all imports except if they contains curly braces
      ignorePattern: String.raw`^import\s+(type\s+)?((?!\{).)*from\s+['"].+['"];?$|shared/localizations/|eslint-disable`,
    },
  ],
  '@stylistic/max-statements-per-line': [2, { max: 2 }],
  '@stylistic/member-delimiter-style': 2,
  '@stylistic/multiline-comment-style': 0,
  '@stylistic/multiline-ternary': [2, 'always-multiline'],
  '@stylistic/new-parens': 2,
  '@stylistic/newline-per-chained-call': [2, { ignoreChainWithDepth: 3 }],
  '@stylistic/no-confusing-arrow': 2,
  '@stylistic/no-extra-semi': 2,
  '@stylistic/no-floating-decimal': 2,
  '@stylistic/no-mixed-operators': 2,
  '@stylistic/no-mixed-spaces-and-tabs': 2,
  '@stylistic/no-multi-spaces': 2,
  '@stylistic/no-multiple-empty-lines': [
    2,
    {
      max: 1,
      maxBOF: 0,
      maxEOF: 1,
    },
  ],
  '@stylistic/no-tabs': 2,
  '@stylistic/no-trailing-spaces': 2,
  '@stylistic/no-whitespace-before-property': 2,
  '@stylistic/nonblock-statement-body-position': [2, 'any'],
  '@stylistic/object-curly-newline': [
    2,
    {
      multiline: true,
      consistent: true,
    },
  ],
  '@stylistic/object-curly-spacing': [2, 'always'],
  '@stylistic/object-property-newline': [
    2,
    { allowAllPropertiesOnSameLine: true },
  ],
  '@stylistic/one-var-declaration-per-line': 0,
  '@stylistic/operator-linebreak': [
    2,
    'before',
    {
      overrides: {
        '=': 'after',
        '+=': 'after',
        '-=': 'after',
        '*=': 'after',
      },
    },
  ],
  '@stylistic/padded-blocks': [2, 'never'],
  '@stylistic/padding-line-between-statements': [
    'error',
    {
      blankLine: 'always',
      prev: '*',
      next: [
        'return',
        'break',
        'export',
        'for',
        'if',
        'switch',
        'try',
        'while',
      ],
    },
    // Imports
    {
      blankLine: 'always',
      prev: 'import',
      next: '*',
    },
    {
      blankLine: 'any',
      prev: 'import',
      next: 'import',
    },
    // Imports
    // Switch keywords
    {
      blankLine: 'always',
      prev: '*',
      next: ['case', 'default'],
    },
    // Switch keywords
  ],
  '@stylistic/quote-props': [2, 'as-needed', { numbers: true }],
  '@stylistic/quotes': [2, 'single'],
  '@stylistic/rest-spread-spacing': [2, 'never'],
  '@stylistic/semi': 2,
  '@stylistic/semi-spacing': 2,
  '@stylistic/semi-style': 2,
  '@stylistic/space-before-blocks': 2,
  '@stylistic/space-before-function-paren': [
    2,
    {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always',
    },
  ],
  '@stylistic/space-in-parens': 2,
  '@stylistic/space-infix-ops': 2,
  '@stylistic/space-unary-ops': 2,
  '@stylistic/spaced-comment': 2,
  '@stylistic/switch-colon-spacing': 2,
  '@stylistic/template-curly-spacing': 2,
  '@stylistic/template-tag-spacing': 2,
  '@stylistic/type-annotation-spacing': 2,
  '@stylistic/type-generic-spacing': 2,
  '@stylistic/type-named-tuple-spacing': 2,
  '@stylistic/wrap-iife': 2,
  '@stylistic/wrap-regex': 2,
  '@stylistic/yield-star-spacing': [2, 'after'],
};

export default mainStylisticRules;
