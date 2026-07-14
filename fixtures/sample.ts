import { readFile } from 'node:fs/promises';

export const readIt = async (path: string): Promise<string> => readFile(path, 'utf8');

export const toArray = (value: string): string[] => [value];
