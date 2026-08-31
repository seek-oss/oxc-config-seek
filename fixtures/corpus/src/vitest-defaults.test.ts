import { test as nodeTest } from 'node:test';

import mocked from './__mocks__/thing';
import { describe, it, expect, vi } from 'vitest';

const assertThing = (value: unknown) => Boolean(value);

describe('rule defaults', () => {
  it('assertion helper is not a recognised assertion', () => {
    assertThing(1);
  });

  it('expect takes exactly one argument', () => {
    expect(1, 2).toBe(1);
  });

  it(' leading space in title', () => {
    expect(1).toBe(1);
  });

  it('conditional expect', () => {
    if (Date.now() > 0) {
      expect(1).toBe(1);
    }
  });

  it.only('focused test', () => {
    expect(1).toBe(1);
  });

  // it('commented out test', () => {});
});

describe('describe callback returning a value', () => {
  it('nested', () => {
    expect(1).toBe(1);
  });
  return 1;
});

it('interpolated inline snapshot', () => {
  const name = 'x';
  expect(name).toMatchInlineSnapshot(`${name}`);
});

it('promise with expect that is never awaited', () => {
  Promise.resolve().then(() => {
    expect(1).toBe(1);
  });
});

it('async callback that awaits nothing', async () => {
  expect(1).toBe(1);
});

it('mock called once', () => {
  const fn = vi.fn();
  fn(1);
  expect(fn).toHaveBeenCalledOnce();
  expect(fn).toHaveBeenCalledWith(1);
});

it('async expect function that never awaits', async () => {
  await expect(async () => 1).resolves.toBe(1);
});

void nodeTest;
void mocked;

it.concurrent('concurrent snapshot without local context', () => {
  expect(1).toMatchSnapshot();
});

describe('standalone expect inside a describe', () => {
  expect(1).toBe(1);
});
