export function formatMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes)
  const hours = Math.floor(rounded / 60)
  const minutes = rounded % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export const MIN_TIMER_MS = 5 * 60 * 1000
export const MAX_TIMER_MS = 6 * 60 * 60 * 1000
export const TIMER_STEP_MS = 5 * 60 * 1000

export function formatTimer(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  if (hours > 0) return `${hours}:${mm}:${ss}`
  return `${mm}:${ss}`
}

export function snapDurationMs(ms: number): number {
  const stepped = Math.round(ms / TIMER_STEP_MS) * TIMER_STEP_MS
  return Math.min(MAX_TIMER_MS, Math.max(MIN_TIMER_MS, stepped))
}

export function localDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatSessionDuration(durationMinutes: number): string {
  if (durationMinutes < 1) return '<1 min'
  const rounded =
    Number.isInteger(durationMinutes)
      ? durationMinutes
      : Number(durationMinutes.toFixed(1))
  return `${rounded} min`
}

export function formatDeadlineLabel(
  deadline: string,
  now = new Date(),
): { label: string; overdue: boolean } {
  const [year, month, day] = deadline.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' })
  return {
    label: `Due ${weekday}`,
    overdue: deadline < localDateKey(now),
  }
}
