import type { Linter } from 'eslint';

const jsxA11YRules: Linter.RulesRecord = {
  'jsx-a11y/alt-text': 2,
  'jsx-a11y/anchor-ambiguous-text': [
    2,
    {
      words: ['click here', 'here', 'link', 'a link', 'learn more'],
    },
  ],
  'jsx-a11y/anchor-has-content': 2,
  'jsx-a11y/anchor-is-valid': 2,
  'jsx-a11y/aria-activedescendant-has-tabindex': 2,
  'jsx-a11y/aria-props': 2,
  'jsx-a11y/aria-proptypes': 2,
  'jsx-a11y/aria-role': 2,
  'jsx-a11y/aria-unsupported-elements': 2,
  'jsx-a11y/autocomplete-valid': 2,
  'jsx-a11y/click-events-have-key-events': 2,
  'jsx-a11y/control-has-associated-label': [
    2,
    {
      labelAttributes: ['label'],
      depth: 25,
    },
  ],
  'jsx-a11y/heading-has-content': 2,
  'jsx-a11y/html-has-lang': 2,
  'jsx-a11y/iframe-has-title': 2,
  'jsx-a11y/img-redundant-alt': 2,
  'jsx-a11y/interactive-supports-focus': 2,
  'jsx-a11y/label-has-associated-control': [
    2,
    {
      depth: 25,
      labelComponents: ['AppFieldLabel'],
      labelAttributes: ['label'],
    },
  ],
  'jsx-a11y/lang': 2,
  'jsx-a11y/media-has-caption': 2,
  'jsx-a11y/mouse-events-have-key-events': 2,
  'jsx-a11y/no-access-key': 2,
  'jsx-a11y/no-aria-hidden-on-focusable': 2,
  'jsx-a11y/no-autofocus': [2, { ignoreNonDOM: false }],
  'jsx-a11y/no-distracting-elements': 2,
  'jsx-a11y/no-interactive-element-to-noninteractive-role': 2,
  'jsx-a11y/no-noninteractive-element-interactions': 2,
  'jsx-a11y/no-noninteractive-element-to-interactive-role': 2,
  'jsx-a11y/no-noninteractive-tabindex': 2,
  'jsx-a11y/no-redundant-roles': 2,
  'jsx-a11y/no-static-element-interactions': 2,
  'jsx-a11y/prefer-tag-over-role': 2,
  'jsx-a11y/role-has-required-aria-props': 2,
  'jsx-a11y/role-supports-aria-props': 2,
  'jsx-a11y/scope': 2,
  'jsx-a11y/tabindex-no-positive': 2,
};

export default jsxA11YRules;
