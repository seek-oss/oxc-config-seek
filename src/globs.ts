import { js as jsExtensions, ts as tsExtensions } from './extensions.ts';

const allExtensions = [...jsExtensions, ...tsExtensions].join(',');

export const jsGlob = `**/*.{${jsExtensions.join(',')}}`;

export const tsGlob = `**/*.{${tsExtensions.join(',')}}`;

export const allGlob = `**/*.{${allExtensions}}`;

export const cypressGlob = `**/cypress/**/*.{${allExtensions}}`;

// Frozen because this array is shared with every consumer and with our own
// config; spread it (`[...testGlobs]`) where a mutable `files` array is needed.
export const testGlobs: readonly string[] = Object.freeze([
  `**/__tests__/**/*.{${allExtensions}}`,
  `**/*.{spec,test}.{${allExtensions}}`,
]);
