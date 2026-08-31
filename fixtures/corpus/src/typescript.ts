export interface Constructable {
  new (): Constructable;
}
export type IndexSignature = { [key: string]: number };
export namespace Legacy {
  export const value = 1;
}
export const arrayCtor = new Array(1, 2, 3);
export type GenericArray = Array<string>;
export class Aliased {
  method() {
    const self = this;
    return self;
  }
}
export function inferrable(x: number = 1) {
  return x;
}

export interface badName {
  value: string;
}

export type bad_Name = string;

export class lowerClass {}

export type Wrapped<t> = t[];

// Enums are exempt from seek's naming-convention config, so this must NOT be
// reported by either linter.
export enum lower_case {
  a = 1,
}
