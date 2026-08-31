import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CORE_ALIASES,
  GRANULARITY_DIFFERS,
  KNOWN_EXTRA,
  KNOWN_MISSING,
  RENAMED,
} from './expected-differences.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, '..');
const corpus = join(here, 'corpus');

interface Finding {
  file: string;
  line: number;
  rule: string;
  severity: 'error' | 'warn';
}

const key = (f: Finding) => `${f.file} ${f.rule} (${f.severity})`;

const tally = (findings: Finding[]): Map<string, number[]> => {
  const grouped = new Map<string, number[]>();
  for (const finding of findings) {
    const lines = grouped.get(key(finding)) ?? [];
    lines.push(finding.line);
    grouped.set(key(finding), lines);
  }
  return grouped;
};

const run = (
  cmd: string,
  args: string[],
  cwd: string,
): { stdout: string; stderr: string; status: number | null } => {
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64e6,
  });
  if (result.error) {
    throw result.error;
  }
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
  };
};

const runJson = <T>(
  cmd: string,
  args: string[],
  cwd: string,
  open: '{' | '[',
): T => {
  const { stdout, stderr, status } = run(cmd, args, cwd);
  const start = stdout.indexOf(open);
  if (start === -1) {
    throw new Error(
      `${cmd} produced no JSON output (exit ${String(status)}):\n${
        stderr || stdout
      }`,
    );
  }
  return JSON.parse(stdout.slice(start)) as T;
};

const runOk = (cmd: string, args: string[], cwd: string): void => {
  const { stdout, stderr, status } = run(cmd, args, cwd);
  if (status !== 0) {
    throw new Error(
      `${cmd} failed (exit ${String(status)}):\n${stderr || stdout}`,
    );
  }
};

const canonical = (raw: string): string => {
  const oxlint = /^(\w[\w-]*)\((.+)\)$/u.exec(raw);
  let name = oxlint ? `${oxlint[1]}/${oxlint[2]}` : raw;

  name = name
    .replace(/^@typescript-eslint\//u, 'typescript/')
    .replace(/^import-x\//u, 'import/')
    .replace(/^react-hooks\//u, 'react/')
    .replace(/^eslint\//u, '');

  name = RENAMED[name] ?? name;

  const bare = name.replace(/^[\w-]+\//u, '');
  return CORE_ALIASES.includes(bare) ? bare : name;
};

const collectEslint = (): Finding[] => {
  const results = runJson<
    Array<{
      filePath: string;
      messages: Array<{
        ruleId: string | null;
        line?: number;
        severity: number;
        message: string;
      }>;
    }>
  >(
    'pnpm',
    [
      'exec',
      'eslint',
      '--config',
      join(here, 'eslint.config.mjs'),
      '--no-ignore',
      '-f',
      'json',
      `${corpus}/src`,
    ],
    root,
    '[',
  );

  return results.flatMap((result) =>
    result.messages.map((message) => {
      if (!message.ruleId) {
        throw new Error(
          `ESLint could not lint ${result.filePath}: ${message.message}`,
        );
      }
      return {
        file: relative(corpus, result.filePath),
        line: message.line ?? 0,
        rule: canonical(message.ruleId),
        severity: message.severity === 1 ? 'warn' : 'error',
      } satisfies Finding;
    }),
  );
};

const collectOxlint = (): Finding[] => {
  const { diagnostics } = runJson<{
    diagnostics: Array<{
      code: string;
      severity: string;
      filename: string;
      labels?: Array<{ span: { line: number } }>;
    }>;
  }>(
    'pnpm',
    [
      'exec',
      'oxlint',
      '--config',
      join(here, 'oxlint.config.ts'),
      '--no-ignore',
      '-f',
      'json',
      `${corpus}/src`,
    ],
    root,
    '{',
  );

  return diagnostics.map((diagnostic) => ({
    file: relative(corpus, diagnostic.filename),
    line: diagnostic.labels?.[0]?.span.line ?? 0,
    rule: canonical(diagnostic.code),
    severity: diagnostic.severity === 'warning' ? 'warn' : 'error',
  }));
};

const checkLint = (): string[] => {
  const drop = (findings: Finding[], ignored: readonly string[]) =>
    findings.filter((finding) => !ignored.includes(finding.rule));

  const eslint = drop(collectEslint(), [...KNOWN_MISSING, ...KNOWN_EXTRA]);
  const oxlint = drop(collectOxlint(), [...KNOWN_MISSING, ...KNOWN_EXTRA]);

  const fromEslint = tally(eslint);
  const fromOxlint = tally(oxlint);

  const problems: string[] = [];
  for (const entry of new Set([...fromEslint.keys(), ...fromOxlint.keys()])) {
    const a = fromEslint.get(entry) ?? [];
    const b = fromOxlint.get(entry) ?? [];

    const lenient = GRANULARITY_DIFFERS.some((rule) =>
      entry.includes(` ${rule} (`),
    );
    const agrees = lenient
      ? a.length > 0 === b.length > 0
      : a.length === b.length;
    if (agrees) {
      continue;
    }
    const where = (lines: number[]) =>
      lines.length > 0
        ? `lines ${lines.sort((x, y) => x - y).join(', ')}`
        : 'not reported';
    problems.push(
      `  ${entry}\n      ESLint: ${where(a)}\n      oxlint: ${where(b)}`,
    );
  }

  if (problems.length === 0) {
    console.log(
      `  lint      ${eslint.length} findings, identical in both toolchains`,
    );
  }
  return problems.sort();
};

const checkFormat = (): string[] => {
  const source = join(here, 'format');
  const problems: string[] = [];
  const temp = mkdtempSync(join(tmpdir(), 'oxc-parity-'));

  try {
    const prettierDir = join(temp, 'prettier');
    const oxfmtDir = join(temp, 'oxfmt');
    cpSync(source, prettierDir, { recursive: true });
    cpSync(source, oxfmtDir, { recursive: true });

    runOk(
      'pnpm',
      [
        'exec',
        'prettier',
        '--config',
        join(here, 'prettier.config.mjs'),
        '--write',
        prettierDir,
      ],
      root,
    );

    runOk(
      'pnpm',
      [
        'exec',
        'oxfmt',
        '-c',
        join(here, 'oxfmt.parity.ts'),
        '--disable-nested-config',
        oxfmtDir,
      ],
      root,
    );

    for (const name of readdirSync(source)) {
      const a = readFileSync(join(prettierDir, name), 'utf8');
      const b = readFileSync(join(oxfmtDir, name), 'utf8');
      if (a !== b) {
        problems.push(`  ${name}: Prettier and oxfmt disagree`);
      }
    }

    if (problems.length === 0) {
      console.log(
        `  format    ${readdirSync(source).length} files, byte-identical output`,
      );
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }

  return problems;
};

console.log('Parity: oxc-config-seek vs eslint-config-seek\n');
const problems = [...checkLint(), ...checkFormat()];

if (problems.length > 0) {
  console.error('\nParity check FAILED:\n');
  console.error(problems.join('\n'));
  console.error(
    '\nIf a difference is intentional, record it in ' +
      'fixtures/expected-differences.ts.',
  );
  process.exit(1);
}

console.log('\nParity check passed.');
