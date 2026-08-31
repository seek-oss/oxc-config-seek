export const radixCall = parseInt('10');
export const yodaCheck = 1 === Number(process.argv[2]);
export const voided = void 0;
export const ternary = Number(1) ? true : false;
export const coerced = !!Number(1);
export const sequence = (1, 2);

export function elseReturn(x: number) {
  if (x) {
    return 1;
  } else {
    return 2;
  }
}

export function returnAssign(b: number) {
  let r = 0;
  r = b;
  return r;
}

export function nestedTernary(x: number) {
  return x ? 1 : x === 2 ? 2 : 3;
}

export function undefInit() {
  // Reassigned below so this does not also trip `prefer-const`.
  let value = undefined;
  value = 1;
  return value;
}
