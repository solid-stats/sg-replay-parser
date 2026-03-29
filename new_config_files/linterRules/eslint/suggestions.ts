/* eslint-disable max-lines */
import { Linter } from 'eslint';

// https://eslint.org/docs/latest/rules/#suggestions
const suggestions: Linter.RulesRecord = {
  'accessor-pairs': [
    2,
    {
      setWithoutGet: true,
      getWithoutSet: false,
      enforceForClassMembers: true,
    },
  ],
  'arrow-body-style': [
    2,
    'as-needed',
    { requireReturnForObjectLiteral: false },
  ],
  'block-scoped-var': 2,
  'capitalized-comments': [
    0,
    'always',
    {
      ignoreInlineComments: true,
      ignoreConsecutiveComments: true,
    },
  ],
  // Replaced with ts/class-methods-use-this
  'class-methods-use-this': 0,

  /*
   * Use tsconfig's noImplicitReturns instead
   * https://typescript-eslint.io/rules/consistent-return
   */
  'consistent-return': 0,
  'consistent-this': 2,
  curly: [2, 'multi-or-nest'],
  // Checked by ts/switch-exhaustiveness-check
  'default-case': 0,
  'default-case-last': 2,
  // Replaced with ts/default-param-last
  'default-param-last': 0,
  // Replaced with ts/dot-notation
  'dot-notation': 0,
  eqeqeq: [2, 'always', { null: 'always' }],
  'func-name-matching': [2, 'always', { considerPropertyDescriptor: true }],
  'func-names': [2, 'as-needed', { generators: 'as-needed' }],
  'func-style': [2, 'declaration', { allowArrowFunctions: true }],
  'grouped-accessor-pairs': [2, 'getBeforeSet'],
  'guard-for-in': 2,
  'id-length': [
    2,
    {
      min: 2,
      max: 40,
      properties: 'always',
      exceptions: [
        '_',
        'i',
        'x',
        'y',
        'z',
        'e',
        'r',
      ],
      exceptionPatterns: ['.+Localization$'],
    },
  ],
  // Replaced with ts/init-declarations
  'init-declarations': 0,
  'logical-assignment-operators': [
    2,
    'always',
    { enforceForIfStatements: true },
  ],
  'max-classes-per-file': [
    2,
    {
      max: 1,
      ignoreExpressions: false,
    },
  ],
  'max-depth': [2, 5],
  'max-lines': [
    2,
    {
      max: 150,
      skipBlankLines: true,
      skipComments: true,
    },
  ],
  // It's useless because components and hooks are also functions
  'max-lines-per-function': 0,
  'max-nested-callbacks': [2, 4],
  // Replaced with ts/max-params
  'max-params': 0,
  'new-cap': [
    2,
    {
      newIsCap: true,
      capIsNew: true,
      properties: true,
    },
  ],
  'no-alert': 2,
  // Replaced with ts/no-array-constructor
  'no-array-constructor': 0,
  'no-bitwise': 2,
  'no-caller': 2,
  'no-case-declarations': 2,
  'no-console': [2, { allow: ['error'] }],
  'no-continue': 1,
  'no-delete-var': 2,
  'no-div-regex': 2,
  'no-else-return': [2, { allowElseIf: false }],
  'no-empty': [2, { allowEmptyCatch: false }],
  // Replaced with ts/no-empty-function
  'no-empty-function': 0,
  'no-empty-static-block': 2,
  'no-eq-null': 2,
  'no-eval': [2, { allowIndirect: false }],
  'no-extend-native': 2,
  'no-extra-bind': 2,
  'no-extra-boolean-cast': [2, { enforceForInnerExpressions: true }],
  'no-global-assign': 2,
  'no-implicit-coercion': [
    2,
    {
      boolean: true,
      number: true,
      string: true,
      disallowTemplateShorthand: true,
    },
  ],
  'no-implicit-globals': 2,
  // Replaced with ts/no-implied-eval
  'no-implied-eval': 0,
  'no-iterator': 2,
  'no-labels': 2,
  'no-lone-blocks': 2,
  'no-lonely-if': 2,
  // Replaced with ts/no-loop-func
  'no-loop-func': 0,
  // Replaced with ts/no-magic-numbers
  'no-magic-numbers': 0,
  'no-multi-assign': [2, { ignoreNonDeclaration: false }],
  'no-multi-str': 2,
  'no-negated-condition': 2,
  'no-new': 2,
  'no-new-func': 2,
  'no-new-wrappers': 2,
  'no-nonoctal-decimal-escape': 2,
  'no-object-constructor': 2,
  'no-octal': 2,
  'no-octal-escape': 2,
  'no-param-reassign': [2, { props: true }],
  'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
  'no-proto': 2,
  'no-redeclare': [2, { builtinGlobals: true }],
  'no-regex-spaces': 2,
  'no-return-assign': [2, 'except-parens'],
  'no-script-url': 2,
  'no-sequences': [2, { allowInParentheses: false }],
  // Replaced with ts/no-shadow
  'no-shadow': 0,
  'no-shadow-restricted-names': 2,
  // Replaced with ts/no-throw-literal
  'no-throw-literal': 0,
  // Conflicts with init-declarations
  'no-undef-init': 0,
  'no-undefined': 0,
  'no-underscore-dangle': [
    1,
    {
      allow: ['_default'],
    },
  ],
  'no-unneeded-ternary': 2,
  'no-unused-expressions': [
    2,
    {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
      enforceForJSX: true,
    },
  ],
  'no-useless-call': 2,
  'no-useless-catch': 2,
  'no-useless-computed-key': 2,
  'no-useless-concat': 2,
  // Replaced with ts/no-useless-constructor
  'no-useless-constructor': 0,
  'no-useless-escape': 2,
  'no-useless-rename': [
    2,
    {
      ignoreImport: false,
      ignoreExport: false,
      ignoreDestructuring: false,
    },
  ],
  'no-useless-return': 2,
  'no-var': 2,
  'no-void': 0,
  'no-with': 2,
  'object-shorthand': [2, 'always'],
  'operator-assignment': [2, 'always'],
  'prefer-arrow-callback': [2, { allowNamedFunctions: true }],
  'prefer-const': [2, { destructuring: 'all' }],
  // Replaced with ts/prefer-destructuring
  'prefer-destructuring': 0,
  'prefer-exponentiation-operator': 2,
  'prefer-named-capture-group': 2,
  'prefer-numeric-literals': 2,
  'prefer-object-has-own': 2,
  'prefer-object-spread': 2,
  // Replaced with ts/prefer-promise-reject-errors
  'prefer-promise-reject-errors': 0,
  'prefer-regex-literals': 2,
  'prefer-rest-params': 2,
  'prefer-spread': 2,
  radix: [2, 'as-needed'],
  // Replaced with ts/require-await
  'require-await': 0,
  'require-unicode-regexp': [2, { requireFlag: 'u' }],
  'require-yield': 2,
  'symbol-description': 2,
  yoda: [2, 'never'],
};

export default suggestions;
