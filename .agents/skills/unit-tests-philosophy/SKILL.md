---
name: unit-tests-philosophy
description: Use when writing, reviewing, or refactoring unit tests to keep them readable, isolated, thorough, explicit, and aligned with TDD.
---

# Unit Tests Philosophy

## Overview

This skill defines a practical, opinionated philosophy for unit tests that remain useful over time.

Primary goal: make changes safer and faster.
Secondary goal: make tests readable enough to serve as executable documentation.

Core principle: test observable behavior as used in the real application, not private implementation details.

Top priorities for unit tests:

- Speed
- Determinism
- Clarity
- Signal quality

## When to Use

Use this skill when:

- Writing new unit tests.
- Refactoring or expanding existing unit tests.
- Reviewing test quality, readability, and maintainability.
- Deciding whether a test belongs in unit scope or should move to integration/E2E.
- Enforcing consistency across a team test suite.

Do not use this skill alone for:

- Integration test architecture.
- E2E strategy.
- Performance/load test design.

## Definition of a Unit Test (in this skill)

A unit test validates one focused behavior of a unit (function, method, class, hook, or small module) in a controlled environment.

Important nuance:

- "One unit" is about behavior scope, not call-count scope.
- A unit test may execute several internal functions.
- It still remains a unit test if assertions focus on one behavior and dependencies are controlled.

## RITE Standard

A good test is **RITE**:

1. **Readable**

- A reviewer should understand intent in seconds.
- Test name must explain behavior and expected result.
- Arrange/Act/Assert must be visually obvious.

2. **Isolated**

- One test must not affect another.
- No leaked timers, mocks, globals, environment changes, locale changes, or shared mutable fixtures.

3. **Thorough**

- Do not stop at happy path.
- Cover meaningful branches, boundaries, and error paths.

4. **Explicit**

- One test verifies one behavior.
- Inputs and expected outputs are unambiguous.
- Avoid hidden assumptions.

Rule of thumb:
If you can break production behavior without breaking tests, tests are not thorough enough.

## Quality Priorities

In order of importance for unit test usefulness:

1. Deterministic outcome.
2. Fast feedback loop.
3. Strong oracle (assertions that actually prove behavior).
4. Maintainable structure.
5. Useful coverage signal.

## Test Authoring Workflow

Use this flow for each behavior under test:

1. Identify behavior

- What must stay true?
- Which input dimensions influence outcome?

2. Define scenarios

- Success path.
- Edge/boundary path.
- Error/invalid path.

3. Build setup with explicit dependencies

- Use builders/factories.
- Use doubles for external boundaries.

4. Write test in AAA structure

- Arrange.
- Act.
- Assert.

5. Validate determinism

- No real time dependency.
- No shared state leak.

6. Review signal quality

- Does this test fail for the right reason?
- Would this catch a realistic regression?

## AAA (Arrange / Act / Assert)

Use AAA in every unit test.

### Arrange

- Create inputs.
- Build fixtures/builders.
- Configure mocks/stubs/fakes.
- Set fake timers/system time when needed.

### Act

- Execute exactly one unit behavior.
- Avoid extra assertions or unrelated setup here.

### Assert

- Verify output state, returned value, thrown error, or side effects that belong to public behavior.
- Keep assertions specific.
- Avoid asserting irrelevant internals.

One behavior can require multiple related assertions. That is valid when all assertions check the same behavior contract.

## Arrange/Assert DRY Rule

If values in Arrange and Assert are logically identical, bind them to variables.

Rules:

- Default: declare inside the test.
- Move outside test only when reused by multiple tests.
- If similar literals stay duplicated intentionally, add a short comment explaining why extraction would hurt clarity.

```ts
// Do

test('Returns result when valid input is passed', () => {
  const input = 1;

  const result = func(input);

  expect(result).toStrictEqual({ result: input });
});
```

## Naming Convention

Test names must:

- Start with a capital letter when they begin with ordinary descriptive text.
- Preserve the original casing of the public API name when the test intentionally starts with it.
- Describe behavior and expected result.
- Be understandable without opening implementation.

Recommended formulas:
`{BehaviorDescription} should return or throw {ExpectedResultOrException} when or if {Argument} is passed or used`
`{PublicApiName} should return or throw {ExpectedResultOrException} when or if {Argument} is passed or used`

Case rule:
- Test names do not have to start with the tested API name.
- If a test starts with ordinary text, that text should start with a capital letter.
- Do not capitalize or normalize the tested API name when you include it.
- If the unit is `normalizeHighlightedTextPart` and the test starts with it, keep `normalizeHighlightedTextPart`.
- If the unit is `ClaimRiskEvaluation` and the test starts with it, keep `ClaimRiskEvaluation`.

Examples:

- `Normalizes text when value contains extra spaces and separators`
- `normalizeHighlightedTextPart should return normalized text when value contains extra spaces and separators`
- `ClaimRiskEvaluation should deny claim when highRiskCustomer is passed`
- `CreditScoreCheck should return credit score when userId is passed`
- `ValidateCreditScore should throw OutOfRangeException when score more than 850 is given`

Naming anti-patterns:

- `test1`
- `works`
- `returns correct value`
- Names that mirror implementation detail instead of behavior.

## Scope and Realism Rules

- Avoid adding new exports that exist only for tests.
- Prefer testing through public/default export.
- Simulate real application usage whenever possible.
- Do not couple tests to private helpers unless those helpers are public API.

If a behavior is impossible to validate through public API, first question architecture and seams before exposing internals only for tests.

## Type Safety Rules in Tests

- Avoid `as` casts whenever possible.
- Prefer builders/factories with defaults and typed `overrides`.
- For intentionally invalid type input, use `@ts-expect-error` with a short reason.

Good pattern:

- `createUser(overrides)`
- `createRequestParams(overrides)`

Bad pattern:

- Large ad-hoc object literals copied per test.
- Repeated casting to force invalid shape without explanation.

## `describe` Usage

Use `describe` only to group related tests and avoid duplicated naming context.

Rules:

- Do not wrap the entire file in one generic `describe` if it adds no value.
- Prefer flat `test` blocks when grouping does not reduce noise.
- Group by behavior mode or scenario family, not by arbitrary labels.

## TDD (RRR)

Follow Red-Green-Refactor:

1. **Red**

- Write a failing test from requirement/spec.
- Failure must be meaningful.

2. **Green**

- Add minimal production code to satisfy test.
- Do not implement unrequested behavior.

3. **Refactor**

- Improve readability/structure without changing behavior.
- Keep test suite green.

Strict rule:
Do not add extra production functionality after reaching green unless covered by a new failing test.

## Determinism and Flakiness

Determinism means:

- Same code + same inputs + same environment = same result.

Common flakiness causes:

- Real timers.
- Real system date/time.
- Shared mutable state.
- Test order dependency.
- Environment leakage.
- Hidden dependency on locale/timezone/randomness.

Preferred controls:

- Fake timers.
- Frozen system time.
- Seeded randomness.
- Explicit setup/cleanup.
- Localized fixtures.

### Reruns policy

- Reruns can be used to detect flaky tests.
- Reruns are never a fix.
- Fix the root cause of nondeterminism.

## Time-Based Tests

Never use sleep-based waiting in unit tests when deterministic clock control is possible.

Use:

- Fake timers.
- `setSystemTime`/fixed clock abstraction.

Avoid:

- `sleep` / `setTimeout` waiting for real wall-clock time.

## Test Doubles

Use doubles to isolate external boundaries.

### Vocabulary

- **Dummy**: placeholder, not behavior-relevant.
- **Stub**: returns predefined responses.
- **Fake**: lightweight working substitute.
- **Spy**: records calls/arguments.
- **Mock**: interaction-verified double.

Practical grouping:

- Interaction-focused: mocks/spies.
- State/response-focused: stubs/fakes.

Guidance:

- Prefer stubs/fakes for stable behavior modeling.
- Use mocks/spies when interaction is part of contract.
- Avoid over-mocking internals.

## Over-Mocking Anti-Pattern

Symptoms:

- Asserting long internal call chains.
- Test breaks after harmless refactor.
- High mock-to-assert noise ratio.

Fix:

- Assert externally visible behavior.
- Mock only true boundaries (network, disk, time, process-level dependencies).

## Assertions and Oracle Strength

A strong test oracle:

- Fails on real regression.
- Avoids passing on wrong behavior.
- Avoids checking irrelevant internals.

Prefer:

- Contract-level assertions.
- Exact checks for deterministic values.
- Intentional approximate checks for floating-point boundaries when required.

Avoid:

- Trivial assertions (`expect(true).toBe(true)`).
- Snapshot noise for unstable outputs.
- Assertions that only mirror implementation steps.

## Coverage and Mutation Mindset

Coverage is useful but insufficient by itself.

Rules:

- Treat structural coverage as diagnostic signal.
- Never treat coverage percentage as proof of quality.
- Use mutation testing (when available) to evaluate fault-detection strength.

Coverage answers:

- What code was executed?

Mutation answers:

- Would tests detect plausible faults?

Use both as complementary quality signals.

## Project Patterns

Apply these patterns consistently in this codebase:

1. Parameterized tests for input matrices (`test.each`) when assertion logic is the same and only data changes.
   Example:

   ```ts
   test.each([
     [':50', 50, '00:50'],
     ['2:', 120, '02:00'],
   ])(
     'Parses mm:ss input %s with missing part on blur',
     (value, expectedSeconds, expectedFormatted) => {
       const store = getFormValueStore(0);
       const { result } = renderHook(() => useInputValue(store));

       act(() => {
         result.current.onChange(value);
       });
       act(() => {
         result.current.onBlur();
       });

       expect(store.value).toBe(expectedSeconds);
       expect(result.current.value).toBe(expectedFormatted);
     },
   );
   ```

2. Case-table style (`cases` array + single runner function) for repeated scenario setup with different expected outcomes.
   Example:

   ```ts
   type Case = {
     name: string;
     status: number;
     assert: (ctx: Callbacks) => void;
   };

   const cases: Case[] = [
     {
       name: 'Handles not found',
       status: 404,
       assert: ({ onNotFound }) => {
         expect(onNotFound).toHaveBeenCalledExactlyOnceWith();
       },
     },
     {
       name: 'Handles timeout',
       status: 408,
       assert: ({ onTimeout }) => {
         expect(onTimeout).toHaveBeenCalledExactlyOnceWith();
       },
     },
   ];

   const runCase = async (currentCase: Case) => {
     fetchMock.mockOnce(new Response(null, { status: currentCase.status }));
     const callbacks = await prepareErrorTest();
     currentCase.assert(callbacks);
   };

   cases.forEach((currentCase) => {
     test(currentCase.name, async () => {
       await runCase(currentCase);
     });
   });
   ```

3. Shared factories/builders for test data (`createXxx(overrides)`) instead of ad-hoc object literals.
   Example:

   ```ts
   const createMockAudioSource = (
     overrides: Partial<CreateSongsAudioSource> = {},
   ): CreateSongsAudioSource => ({
     id: 'audio-1',
     base64: 'data:audio/mp3;base64,dGVzdA==',
     fileName: 'test-song.mp3',
     ...overrides,
   });

   const createSingleModeTableData = (
     overrides: Partial<CreateSongsSingleAudioTableData> = {},
   ): CreateSongsSingleAudioTableData => ({
     id: 'song-1',
     tableMode: 'single',
     name: 'Test Song',
     artist: 'Test Artist',
     cover: null,
     audioSource: createMockAudioSource(),
     ...overrides,
   });
   ```

4. Explicit negative typing checks via `@ts-expect-error` only when testing intentionally invalid inputs; always explain why.
   Example:

   ```ts
   // @ts-expect-error: We intentionally pass an invalid source value to test fallback.
   const result = handleBlur({ source: 'invalid', from: '100', to: '200' });
   expect(result).toBe(undefined);
   ```

5. Deterministic async tests via fake timers when behavior depends on timers/retries/debounce.
   Example:

   ```ts
   beforeEach(() => {
     vi.useFakeTimers();
     vi.clearAllMocks();
   });

   test('Should enable optimistically and succeed', async () => {
     const { result } = renderHook(() => useOptimisticToggleState(config));
     let enablePromise: Promise<void> | null = null;

     act(() => {
       enablePromise = result.current.enable();
     });

     await act(async () => {
       vi.advanceTimersByTime(requestPromiseTimeout + 1);
       await enablePromise;
     });

     expect(result.current.isEnabled).toBe(true);
   });
   ```

6. Extract repeated assertion bundles into test helpers (for example `expectHandledOnce`) to reduce duplication.
   Example:

   ```ts
   const expectHandledOnce = (
     callback: ReturnType<typeof vi.fn>,
     onEnd: ReturnType<typeof vi.fn>,
     onFail: ReturnType<typeof vi.fn>,
   ) => {
     expect(callback).toHaveBeenCalledExactlyOnceWith();
     expect(onEnd).toHaveBeenCalledExactlyOnceWith();
     expect(onFail).not.toHaveBeenCalled();
   };

   test('Handles access restricted', async () => {
     const callbacks = await prepareErrorTest();
     expectHandledOnce(
       callbacks.onAccessRestricted,
       callbacks.onEnd,
       callbacks.onFail,
     );
   });
   ```

## File Placement

If tests are small (up to ~200-300 lines):

- Co-locate with source.
- Example:
  - `func.ts`
  - `func.test.ts`

If tests need decomposition:

- Create folder by tested unit.
- Split by behavior dimensions.
- Example:
  - `func.ts`
  - `func/default.test.ts`
  - `func/success.test.ts`
  - `func/errors.test.ts`

## Fixture and Helper Policy

Use helpers to reduce noise, not to hide intent.

Good helper usage:

- Shared setup logic used by multiple tests.
- Repeated assertion bundles.
- Typed test data builders.

Bad helper usage:

- Helpers that hide critical Arrange state.
- Helpers with side effects not obvious at call site.

## Isolation Checklist

Before finalizing tests, verify:

- No shared mutable state between tests.
- Timers reset/controlled.
- Mocks cleared/reset.
- Environment changes reverted.
- Locale/timezone assumptions explicit.

## Review Checklist

During review, ask:

1. Does each test verify one behavior?
2. Is test naming precise and readable?
3. Is Arrange/Act/Assert clear?
4. Are edges/errors covered where behavior changes?
5. Are assertions meaningful, not decorative?
6. Are tests deterministic and fast?
7. Are dependencies isolated at correct boundaries?
8. Does test survive internal refactor if behavior stays unchanged?

## Common Failure Patterns

- Testing implementation details instead of behavior.
- Over-mocking call chains and internal interactions instead of observable outcomes.
- Shared mutable state across tests.
- Over-reliance on casts instead of typed builders.
- Using `@ts-expect-error` without explaining intent.
- Repeating same assertion blocks across many tests instead of helper extraction.
- Using `sleep`/real waiting in unit tests instead of deterministic time control.
- Writing timer-based async tests without deterministic time control.
- Vague test names that hide intent.
- Missing edge/error assertions.
- Coupling test pass/fail to execution order.

## Minimal Practical Standards

A unit test in this codebase should generally meet all of the following:

- Reads clearly in under a minute.
- Has explicit AAA structure.
- Is deterministic under repeated runs.
- Covers one behavior contract with a strong oracle.
- Uses typed setup patterns (builders/factories) instead of unsafe casting.
- Does not force production API changes only for tests.
