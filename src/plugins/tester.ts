import { describe, it } from 'node:test';

import { RuleTester } from 'oxlint/plugins-dev';

RuleTester.describe = describe;
RuleTester.it = it;

type Rule = Parameters<RuleTester['run']>[1];

const asRule = (rule: object): Rule => rule as Rule;

type Options = NonNullable<RuleTester.InvalidTestCase['options']>;

export const asOptions = (options: readonly object[]): Options =>
  options as Options;

const run =
  (tester: RuleTester) =>
  (name: string, rule: object, cases: RuleTester.TestCases): void =>
    tester.run(name, asRule(rule), cases);

export const test = run(new RuleTester({ eslintCompat: true }));

export const testTs = run(
  new RuleTester({
    eslintCompat: true,
    languageOptions: { parserOptions: { lang: 'ts' } },
  }),
);
