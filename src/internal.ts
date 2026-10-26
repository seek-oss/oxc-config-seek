import { fileURLToPath } from 'node:url';

export const resolvePlugin = (specifier: string) =>
  fileURLToPath(import.meta.resolve(specifier));
