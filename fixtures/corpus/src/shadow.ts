export enum Status {
  Active = 'active',
}
export function takesStatus(Status: string) {
  return Status;
}

const Value = 1;
export function generic<Value>(v: Value) {
  return [v, Value] as const;
}

type Named = string;
export function blockScoped() {
  const Named = 2;
  return Named;
}
