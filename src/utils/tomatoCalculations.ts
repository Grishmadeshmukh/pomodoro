export const MINUTES_PER_TOMATO = 6

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function getRewardMultiplier(date: Date): 1 | 2 {
  return isWeekend(date) ? 2 : 1
}

export function calculateTomatoes(
  focusMinutes: number,
  startedAt: Date = new Date(),
): number {
  if (focusMinutes <= 0) return 0
  return Math.floor(
    (focusMinutes / MINUTES_PER_TOMATO) * getRewardMultiplier(startedAt),
  )
}

export function tomatoNoun(value: number): string {
  return value === 1 ? 'tomato' : 'tomatoes'
}

export function formatTomatoCount(value: number): string {
  return `${value.toLocaleString()} ${tomatoNoun(value)}`
}
