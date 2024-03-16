export function range(len: number): Iterable<number>;
export function range(from: number, to: number): Iterable<number>;
export function* range(a: number, b?: number) {
  const [from, to] = b === undefined ? [0, a] : [a, b];
  for (let i = from; i < to; i++) yield i;
}

export function omit<T extends {}, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as any)),
  ) as any;
}

export function assertDef<T>(x: T | undefined): T {
  if (x === undefined) throw new TypeError("Unexpected undefined");
  return x;
}

export function* take<T>(iter: Iterable<T>, howMany: number) {
  const it = iter[Symbol.iterator]();
  for (const _ of range(howMany)) {
    const x = it.next();
    if (x.done) return;
    yield x.value;
  }
}

export function* skip<T>(iter: Iterable<T>, howMany: number) {
  const it = iter[Symbol.iterator]();
  for (const _ of range(howMany)) it.next();

  while (true) {
    const x = it.next();
    if (x.done) return;
    yield x.value;
  }
}
