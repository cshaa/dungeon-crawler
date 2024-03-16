export function randomUniform(from: number, to: number): number {
  return from + (to - from) * Math.random();
}

export function randomInt(from: number, toExcl: number): number {
  return Math.floor(randomUniform(from, toExcl));
}

export function randomItem<T>(
  arr: T[],
  weight?: (item: T, index: number) => number,
): T {
  if (arr.length === 0) throw new TypeError("Cannot pick from an empty array");
  if (arr.length === 1) return arr[0];

  if (weight) return randomItemWeighted(arr, weight);
  return arr[randomInt(0, arr.length)];
}

function randomItemWeighted<T>(
  arr: T[],
  weight: (item: T, index: number) => number,
): T {
  const [sum, stops] = arr.reduce<[number, number[]]>(
    ([sum, stops], item, index) => {
      const itemStop = sum + weight(item, index);
      return [itemStop, [...stops, itemStop]];
    },
    [0, []],
  );

  const target = randomUniform(0, sum);
  const index = stops.findIndex((next, i) => {
    const prev = stops[i - 1] ?? 0;
    return prev <= target && target < next;
  });

  return arr[index];
}
