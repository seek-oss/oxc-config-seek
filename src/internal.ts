import { fileURLToPath } from 'node:url';

import { js as jsExtensions, ts as tsExtensions } from './extensions.ts';

export const allExtensions = [...jsExtensions, ...tsExtensions].join(',');

export const jsGlob = `**/*.{${jsExtensions.join(',')}}`;
export const tsGlob = `**/*.{${tsExtensions.join(',')}}`;
export const allGlob = `**/*.{${allExtensions}}`;

export const resolvePlugin = (specifier: string) =>
  fileURLToPath(import.meta.resolve(specifier));
