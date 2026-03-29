/* eslint-disable max-lines */
import { Linter } from 'eslint';

// https://github.com/jsx-eslint/eslint-plugin-react?tab=readme-ov-file#list-of-supported-rules
const defaultReactRules: Linter.RulesRecord = {
  'react/boolean-prop-naming': [
    2,
    {
      propTypeNames: ['boolean'],
      rule: '^(?!is|has)[a-z]([A-Za-z0-9]?)+',
      message: 'Do not use prefix "is" or "has" for boolean props',
      validateNested: false,
    },
  ],
  'react/button-has-type': 1,
  'react/checked-requires-onchange-or-readonly': 2,
  'react/default-props-match-prop-types': 2,
  'react/destructuring-assignment': 0,
  'react/display-name': [
    2,
    {
      ignoreTranspilerName: false,
      checkContextObjects: true,
    },
  ],
  'react/forbid-component-props': 0,
  'react/forbid-dom-props': 0,
  'react/forbid-elements': 0,
  'react/forbid-foreign-prop-types': [2, { allowInPropTypes: false }],
  'react/forbid-prop-types': 2,
  'react/forward-ref-uses-ref': 2,
  'react/function-component-definition': [
    2,
    {
      namedComponents: 'function-declaration',
      unnamedComponents: 'arrow-function',
    },
  ],
  'react/iframe-missing-sandbox': 2,
  'react/jsx-boolean-value': 2,
  // Replaced with @stylistic/jsx-child-element-spacing
  'react/jsx-child-element-spacing': 0,
  // Replaced with @stylistic/jsx-closing-bracket-location
  'react/jsx-closing-bracket-location': 0,
  // Replaced with @stylistic/jsx-closing-tag-location
  'react/jsx-closing-tag-location': 0,
  // Replaced with @stylistic/jsx-curly-brace-presence
  'react/jsx-curly-brace-presence': 0,
  // Replaced with @stylistic/jsx-curly-newline
  'react/jsx-curly-newline': 0,
  // Replaced with @stylistic/jsx-curly-spacing
  'react/jsx-curly-spacing': 0,
  // Replaced with @stylistic/jsx-equals-spacing
  'react/jsx-equals-spacing': 0,
  'react/jsx-filename-extension': 0,
  // Replaced with @stylistic/jsx-first-prop-new-line
  'react/jsx-first-prop-new-line': 0,
  'react/jsx-fragments': [2, 'syntax'],
  'react/jsx-handler-names': [
    0,
    {
      eventHandlerPrefix: 'handle',
      eventHandlerPropPrefix: 'on',
      checkLocalVariables: true,
      checkInlineFunction: true,
    },
  ],
  // Replaced with @stylistic/jsx-indent
  'react/jsx-indent': 0,
  // Replaced with @stylistic/jsx-indent-props
  'react/jsx-indent-props': 0,
  'react/jsx-key': [
    2,
    {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: false,
    },
  ],
  'react/jsx-max-depth': 0,
  // Replaced with @stylistic/jsx-max-props-per-line
  'react/jsx-max-props-per-line': 0,
  // Replaced with @stylistic/jsx-newline
  'react/jsx-newline': 0,
  'react/jsx-no-bind': 0,
  'react/jsx-no-comment-textnodes': 2,
  'react/jsx-no-constructed-context-values': 2,
  'react/jsx-no-duplicate-props': [2, { ignoreCase: true }],
  'react/jsx-no-leaked-render': 2,
  'react/jsx-no-literals': 0,
  'react/jsx-no-script-url': 2,
  'react/jsx-no-target-blank': [
    2,
    {
      enforceDynamicLinks: 'always',
      warnOnSpreadAttributes: true,
      links: true,
      forms: true,
    },
  ],
  'react/jsx-no-undef': [2, { allowGlobals: false }],
  'react/jsx-no-useless-fragment': [2, { allowExpressions: false }],
  // Replaced with @stylistic/jsx-one-expression-per-line
  'react/jsx-one-expression-per-line': 0,
  // Replaced with @stylistic/jsx-pascal-case
  'react/jsx-pascal-case': 0,
  // Replaced with @stylistic/jsx-props-no-multi-spaces
  'react/jsx-props-no-multi-spaces': 0,
  'react/jsx-props-no-spread-multi': 2,
  'react/jsx-props-no-spreading': [
    1,
    {
      html: 'enforce',
      custom: 'enforce',
      explicitSpread: 'ignore',
    },
  ],
  // Replaced with @stylistic/jsx-sort-props
  'react/jsx-sort-props': 0,
  // Replaced with @stylistic/jsx-tag-spacing
  'react/jsx-tag-spacing': 0,
  'react/jsx-uses-react': 2,
  'react/jsx-uses-vars': 2,
  // Replaced with @stylistic/jsx-wrap-multilines
  'react/jsx-wrap-multilines': 0,
  'react/no-access-state-in-setstate': 2,
  'react/no-adjacent-inline-elements': 2,
  'react/no-array-index-key': 2,
  'react/no-arrow-function-lifecycle': 0,
  'react/no-children-prop': 2,
  'react/no-danger-with-children': 2,
  'react/no-danger': 2,
  'react/no-deprecated': 2,
  'react/no-did-mount-set-state': 0,
  'react/no-did-update-set-state': 0,
  'react/no-direct-mutation-state': 2,
  'react/no-find-dom-node': 2,
  'react/no-invalid-html-attribute': 2,
  'react/no-is-mounted': 0,
  'react/no-multi-comp': 2,
  'react/no-namespace': 2,
  'react/no-object-type-as-default-prop': 2,
  'react/no-redundant-should-component-update': 0,
  'react/no-render-return-value': 2,
  'react/no-set-state': 0,
  'react/no-string-refs': [2, { noTemplateLiterals: true }],
  'react/no-this-in-sfc': 2,
  'react/no-typos': 2,
  'react/no-unescaped-entities': 2,
  'react/no-unknown-property': 2,
  'react/no-unsafe': 2,
  'react/no-unstable-nested-components': [2, { allowAsProps: false }],
  'react/no-unused-class-component-methods': 0,
  'react/no-unused-prop-types': 2,
  'react/no-unused-state': 0,
  'react/no-will-update-set-state': 0,
  'react/prefer-es6-class': [2, 'always'],
  'react/prefer-exact-props': 2,
  'react/prefer-read-only-props': 0,
  'react/prefer-stateless-function': [2, { ignorePureComponents: false }],
  'react/prop-types': 2,
  'react/react-in-jsx-scope': 0,
  'react/require-default-props': 0,
  'react/require-optimization': 0,
  'react/require-render-return': 0,
  // Replaced with @stylistic/jsx-self-closing-comp
  'react/self-closing-comp': 0,
  'react/sort-comp': 0,
  'react/sort-default-props': 2,
  'react/sort-prop-types': [
    2,
    {
      callbacksLast: true,
      ignoreCase: true,
      noSortAlphabetically: true,
      checkTypes: true,
    },
  ],
  'react/state-in-constructor': 0,
  'react/static-property-placement': 0,
  'react/style-prop-object': 2,
  'react/void-dom-elements-no-children': 2,
};

export default defaultReactRules;
