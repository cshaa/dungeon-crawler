export function range(len: number): Iterable<number>;
export function range(from: number, to: number): Iterable<number>;
export function* range(a: number, b?: number) {
  const [from, to] = b === undefined ? [0, a] : [a, b];
  for (let i = from; i < to; i++) yield i;
}
