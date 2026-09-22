export function checkGoldenTomatoEligibility(
  items: { completed: boolean }[],
): boolean {
  return items.length > 0 && items.every((item) => item.completed)
}

export function shouldAwardGoldenTomato(
  items: { completed: boolean }[],
  alreadyEarned: boolean,
): boolean {
  return !alreadyEarned && checkGoldenTomatoEligibility(items)
}
