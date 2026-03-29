import { Linter } from 'eslint';

// https://github.com/mobxjs/mobx/tree/main/packages/eslint-plugin-mobx#rules
const mobxRules: Linter.RulesRecord = {
  'mobx/exhaustive-make-observable': 2,
  'mobx/unconditional-make-observable': 2,
  'mobx/missing-make-observable': 2,
  // TODO: Enable as warning after https://github.com/eslint/eslint/issues/18696 implementation
  'mobx/missing-observer': 0,
};

export default mobxRules;
