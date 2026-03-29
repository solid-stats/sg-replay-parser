/* eslint-disable max-lines */
import { Linter } from 'eslint';

// https://typescript-eslint.io/rules/
const typescriptRules: Linter.RulesRecord = {
  'ts/adjacent-overload-signatures': 2,
  'ts/array-type': [2, { default: 'array-simple' }],
  'ts/await-thenable': 2,
  'ts/ban-ts-comment': [
    2,
    {
      minimumDescriptionLength: 3,
      'ts-check': false,
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': false,
      'ts-nocheck': false,
    },
  ],
  'ts/ban-tslint-comment': 2,
  'ts/class-methods-use-this': [2, { enforceForClassFields: true }],
  'ts/consistent-generic-constructors': [2, 'constructor'],
  'ts/consistent-indexed-object-style': [2, 'record'],
  'ts/consistent-type-assertions': [
    2,
    {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'never',
      arrayLiteralTypeAssertions: 'never',
    },
  ],
  'ts/consistent-type-definitions': [2, 'type'],
  'ts/consistent-type-exports': [
    2,
    {
      fixMixedExportsWithInlineTypeSpecifier: false,
    },
  ],
  'ts/default-param-last': 2,
  'ts/dot-notation': [2, { allowKeywords: true }],
  /** Disabled because it conflicts with explicit-module-boundary-types.
   *
   * This rule forces to type all functions/classes/etc.
   * explicit-module-boundary-types forces to type only public
   * functions/classes/etc */
  'ts/explicit-function-return-type': 0,
  'ts/explicit-member-accessibility': [
    2,
    {
      accessibility: 'explicit',
      overrides: {
        constructors: 'no-public',
      },
    },
  ],
  'ts/explicit-module-boundary-types': 2,
  'ts/init-declarations': [2, 'always'],
  'ts/max-params': [
    2,
    {
      max: 4,
      countVoidThis: false,
    },
  ],
  'ts/member-ordering': [
    2,
    {
      default: [
        'field',
        'get',
        'set',
        'constructor',
        'accessor',
        'method',
        'signature',
      ],
    },
  ],
  'ts/method-signature-style': [2, 'property'],
  'ts/naming-convention': [
    2,
    {
      selector: 'typeLike',
      format: ['PascalCase'],
    },
    {
      selector: 'enum',
      format: ['UPPER_CASE'],
    },
    {
      selector: 'enumMember',
      format: ['PascalCase'],
    },
  ],
  'ts/no-array-constructor': 2,
  'ts/no-array-delete': 2,
  'ts/no-base-to-string': 2,
  'ts/no-confusing-non-null-assertion': 2,
  'ts/no-confusing-void-expression': 2,
  'ts/no-deprecated': 2,
  'ts/no-duplicate-enum-values': 2,
  'ts/no-duplicate-type-constituents': 2,
  'ts/no-empty-function': [2, { allow: ['private-constructors'] }],
  'ts/no-empty-object-type': 2,
  'ts/no-explicit-any': [2, { fixToUnknown: true }],
  'ts/no-extra-non-null-assertion': 2,
  'ts/no-extraneous-class': 2,
  'ts/no-floating-promises': 2,
  'ts/no-for-in-array': 2,
  'ts/no-implied-eval': 2,
  'ts/no-import-type-side-effects': 2,
  'ts/no-inferrable-types': 2,
  'ts/no-invalid-void-type': [
    2,
    {
      allowAsThisParameter: false,
      allowInGenericTypeArguments: true,
    },
  ],
  'ts/no-loop-func': 2,
  'ts/no-magic-numbers': [
    1,
    {
      ignoreEnums: true,
      ignoreDefaultValues: true,
    },
  ],
  'ts/no-meaningless-void-operator': [2, { checkNever: true }],
  'ts/no-misused-new': 2,
  'ts/no-misused-promises': [
    2,
    {
      checksVoidReturn: false,
    },
  ],
  'ts/no-misused-spread': 2,
  'ts/no-mixed-enums': 2,
  'ts/no-namespace': 2,
  'ts/no-non-null-asserted-nullish-coalescing': 2,
  'ts/no-non-null-asserted-optional-chain': 2,
  'ts/no-non-null-assertion': 2,
  'ts/no-redundant-type-constituents': 2,
  'ts/no-require-imports': 2,
  'ts/no-shadow': [
    2,
    {
      builtinGlobals: false,
      hoist: 'all',
      ignoreOnInitialization: false,
      ignoreTypeValueShadow: false,
      // eslint-disable-next-line id-length
      ignoreFunctionTypeParameterNameValueShadow: false,
    },
  ],
  'ts/no-this-alias': 2,
  'ts/no-unnecessary-boolean-literal-compare': 2,
  'ts/no-unnecessary-condition': [2, { checkTypePredicates: true }],
  'ts/no-unnecessary-parameter-property-assignment': 2,
  'ts/no-unnecessary-qualifier': 2,
  'ts/no-unnecessary-template-expression': 2,
  'ts/no-unnecessary-type-arguments': 2,
  'ts/no-unnecessary-type-assertion': 2,
  'ts/no-unnecessary-type-constraint': 2,
  'ts/no-unnecessary-type-parameters': 1,
  'ts/no-unsafe-argument': 2,
  'ts/no-unsafe-assignment': 2,
  'ts/no-unsafe-call': 2,
  'ts/no-unsafe-declaration-merging': 2,
  'ts/no-unsafe-enum-comparison': 2,
  'ts/no-unsafe-function-type': 1,
  'ts/no-unsafe-member-access': 2,
  'ts/no-unsafe-return': 2,
  'ts/no-unsafe-type-assertion': 0,
  'ts/no-unsafe-unary-minus': 2,
  'no-unused-expressions': 0,
  'ts/no-unused-expressions': [
    2,
    {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
      enforceForJSX: true,
    },
  ],
  'ts/no-unused-vars': [
    2,
    {
      vars: 'all',
      args: 'after-used',
      caughtErrors: 'all',
      ignoreRestSiblings: false,
      ignoreClassWithStaticInitBlock: false,
      reportUsedIgnorePattern: false,
      varsIgnorePattern: '^_$',
    },
  ],
  'ts/no-use-before-define': [
    2,
    {
      functions: true,
      classes: true,
      variables: true,
      enums: true,
      typedefs: true,
      ignoreTypeReferences: false,
      allowNamedExports: false,
    },
  ],
  'ts/no-useless-constructor': 2,
  'ts/no-useless-empty-export': 2,
  'ts/no-wrapper-object-types': 2,
  'ts/only-throw-error': 2,
  'ts/parameter-properties': [2, { prefer: 'parameter-property' }],
  'ts/prefer-as-const': 2,
  'ts/prefer-destructuring': [
    2,
    {
      array: true,
      object: true,
    },
    {
      enforceForRenamedProperties: false,
      enforceForDeclarationWithTypeAnnotation: false,
    },
  ],
  'ts/prefer-enum-initializers': 2,
  'ts/prefer-find': 2,
  'ts/prefer-for-of': 2,
  'ts/prefer-function-type': 2,
  'ts/prefer-includes': 2,
  'ts/prefer-literal-enum-member': 2,
  'ts/prefer-namespace-keyword': 2,
  'ts/prefer-nullish-coalescing': [
    1,
    {
      ignorePrimitives: {
        string: true,
        boolean: true,
      },
    },
  ],
  'ts/prefer-optional-chain': 2,
  'ts/prefer-promise-reject-errors': 2,
  'ts/prefer-readonly-parameter-types': 0,
  'ts/prefer-reduce-type-parameter': 2,
  'ts/prefer-regexp-exec': 2,
  'ts/prefer-return-this-type': 2,
  'ts/prefer-string-starts-ends-with': 2,
  'ts/promise-function-async': 2,
  'ts/related-getter-setter-pairs': 2,
  'ts/require-array-sort-compare': 2,
  'ts/require-await': 2,
  'ts/restrict-plus-operands': 2,
  'ts/restrict-template-expressions': [
    2,
    {
      allowNumber: true,
    },
  ],
  'ts/return-await': [2, 'in-try-catch'],
  'ts/strict-boolean-expressions': [
    'error',
    {
      allowString: true,
      allowNumber: false,
      allowNullableObject: true,
      allowNullableBoolean: true,
      allowNullableString: true,
      allowNullableNumber: false,
      allowNullableEnum: false,
      allowAny: false,
    },
  ],
  'ts/switch-exhaustiveness-check': [
    2,
    {
      allowDefaultCaseForExhaustiveSwitch: true,
      considerDefaultExhaustiveForUnions: false,
      requireDefaultForNonUnion: false,
    },
  ],
  'ts/triple-slash-reference': 2,
  'ts/unbound-method': 2,
  'ts/unified-signatures': 2,
  'ts/use-unknown-in-catch-callback-variable': 2,
};

export default typescriptRules;
