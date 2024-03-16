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
