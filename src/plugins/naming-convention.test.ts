import { asOptions, testTs } from './tester.ts';
import typescriptPlugin from './typescript.ts';

const rule = typescriptPlugin.rules['naming-convention'];

const options = asOptions([
  { selector: 'typeLike', format: ['PascalCase'], leadingUnderscore: 'allow' },
  { selector: 'enum', format: null },
]);

const message = (type: string, name: string) =>
  `${type} name \`${name}\` must match one of the following formats: PascalCase`;

const trimmed = (type: string, name: string, processed: string) =>
  `${type} name \`${name}\` trimmed as \`${processed}\` must match one of the following formats: PascalCase`;

testTs('typescript-js/naming-convention', rule, {
  valid: [
    { code: 'export class Widget {}', options },
    { code: 'export interface Widget {}', options },
    { code: 'export type Widget = string;', options },
    { code: 'export type Wrapper<T> = T[];', options },

    { code: 'export class _Widget {}', options },

    { code: 'export type HTTPResponse = string;', options },
    { code: 'export type $Special = string;', options },

    { code: 'export enum lower_case { a = 1 }', options },

    { code: 'export type Used = Wrapper<string>;', options },
    { code: 'export const widget = 1;', options },
    { code: 'export function widget() {}', options },
  ],
  invalid: [
    {
      code: 'export class widget {}',
      options,
      errors: [{ message: message('Class', 'widget') }],
    },
    {
      code: 'export interface widget {}',
      options,
      errors: [{ message: message('Interface', 'widget') }],
    },
    {
      code: 'export type bad_Name = string;',
      options,
      errors: [{ message: message('Type Alias', 'bad_Name') }],
    },
    {
      code: 'export type Wrapper<t> = t[];',
      options,
      errors: [{ message: message('Type Parameter', 't') }],
    },
    {
      code: 'export class __Widget {}',
      options,
      errors: [{ message: trimmed('Class', '__Widget', '_Widget') }],
    },
    {
      code: 'const Klass = class widget {};\nexport default Klass;',
      options,
      errors: [{ message: message('Class', 'widget') }],
    },
  ],
});
