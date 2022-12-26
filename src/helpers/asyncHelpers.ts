export function delayAsync(n: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, n));
}
