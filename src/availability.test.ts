import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));

let scratch: string;

before(async () => {
  scratch = await mkdtemp(join(tmpdir(), 'oxc-config-seek-probe-'));
});

after(async () => {
  await rm(scratch, { recursive: true, force: true });
});

const probe = async (rule: string): Promise<'implemented' | 'missing'> => {
  const slash = rule.indexOf('/');
  const plugin = slash === -1 ? undefined : rule.slice(0, slash);
  const config = join(scratch, 'probe.json');

  await writeFile(
    config,
    JSON.stringify({
      ...(plugin ? { plugins: [plugin] } : {}),
      rules: { [rule]: 'error' },
    }),
  );

  const args = [
    'exec',
    'oxlint',
    '--config',
    config,
    '--no-ignore',
    'fixtures/smoke',
  ];
  const { stdout, stderr } = await run('pnpm', args, { cwd: root }).catch(
    (error: { stdout?: string; stderr?: string }) => ({
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
    }),
  );
  const output = `${stdout}${stderr}`;

  if (output.includes('not found in plugin')) {
    return 'missing';
  }

  if (output.includes('Failed to parse oxlint configuration file')) {
    throw new Error(`Unexpected config error probing \`${rule}\`:\n${output}`);
  }

  return 'implemented';
};

describe('rule availability', () => {
  it('probes a rule oxlint does implement', async () => {
    assert.equal(await probe('no-console'), 'implemented');
    assert.equal(await probe('react/jsx-key'), 'implemented');
  });

  for (const rule of ['import/no-unresolved', 'import/no-rename-default']) {
    it(`${rule} is still unimplemented`, async () => {
      assert.equal(
        await probe(rule),
        'missing',
        `oxlint now implements \`${rule}\`. It can be enabled directly; drop it from KNOWN_MISSING in fixtures/expected-differences.ts and from Known gaps in the README.`,
      );
    });
  }

  for (const rule of [
    'no-undef-init',
    'no-octal-escape',
    'spaced-comment',
    'no-restricted-syntax',
    'react/no-deprecated',
    'typescript/naming-convention',
  ]) {
    it(`${rule} is still unimplemented`, async () => {
      assert.equal(
        await probe(rule),
        'missing',
        `oxlint now implements \`${rule}\` natively. Prefer it over the bridged rule and drop the corresponding jsPlugins entry, RENAMED mapping and README alias row.`,
      );
    });
  }
});
