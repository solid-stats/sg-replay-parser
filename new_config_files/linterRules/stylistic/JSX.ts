import { Linter } from 'eslint';

// https://eslint.style/rules
const JSXStylisticRules: Linter.RulesRecord = {
  '@stylistic/jsx-child-element-spacing': 2,
  '@stylistic/jsx-closing-bracket-location': [2, 'tag-aligned'],
  '@stylistic/jsx-closing-tag-location': [2, 'line-aligned'],
  '@stylistic/jsx-curly-brace-presence': [2, 'never'],
  '@stylistic/jsx-curly-newline': [
    2,
    {
      singleline: 'forbid',
      // consistent was chosen instead of never because of the long comments
      multiline: 'consistent',
    },
  ],
  '@stylistic/jsx-curly-spacing': 2,
  '@stylistic/jsx-equals-spacing': 2,
  '@stylistic/jsx-first-prop-new-line': 2,
  '@stylistic/jsx-function-call-newline': 2,
  '@stylistic/jsx-indent': [
    2,
    2,
    {
      checkAttributes: true,
      indentLogicalExpressions: true,
    },
  ],
  '@stylistic/jsx-indent-props': [2, 'first'],
  '@stylistic/jsx-max-props-per-line': [2, { when: 'multiline' }],
  '@stylistic/jsx-newline': 2,
  '@stylistic/jsx-one-expression-per-line': 2,
  '@stylistic/jsx-pascal-case': 2,
  '@stylistic/jsx-props-no-multi-spaces': 2,
  '@stylistic/jsx-quotes': [2, 'prefer-double'],
  '@stylistic/jsx-self-closing-comp': 2,

  /*
   * When changing those options
   * do not forget to update "react/sort-prop-types" rules same options
   */
  '@stylistic/jsx-sort-props': [
    2,
    {
      ignoreCase: true,
      noSortAlphabetically: true,
      callbacksLast: true,
      shorthandFirst: false,
      multiline: 'ignore',
      reservedFirst: true,
    },
  ],
  '@stylistic/jsx-tag-spacing': [
    2,
    {
      closingSlash: 'never',
      beforeSelfClosing: 'proportional-always',
      afterOpening: 'never',
      beforeClosing: 'proportional-always',
    },
  ],
  '@stylistic/jsx-wrap-multilines': [
    2,
    {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line',
      condition: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'parens-new-line',
    },
  ],
};

export default JSXStylisticRules;
