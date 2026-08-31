export class WithAccessors {
  #value = 1;
  get value() {
    return this.#value;
  }
  set value(next: number) {
    this.#value = next;
  }
}

export const literalAccessors = {
  get thing() {
    return 1;
  },
  set thing(next: number) {
    void next;
  },
};
