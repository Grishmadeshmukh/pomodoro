import { localDateKey } from './dateUtils'
import { isWeekend } from './tomatoCalculations'

const MEANINGFUL_FOCUS_MINUTES = 1
const MAX_LOOKBACK_DAYS = 400

export function isStreakExemptDay(
  date: Date,
  holidayDates: Iterable<string> = [],
): boolean {
  const holidays = holidayDates instanceof Set ? holidayDates : new Set(holidayDates)
  return isWeekend(date) || holidays.has(localDateKey(date))
}

export function getFocusedDateKeys(
  sessions: { startedAt: string; durationMinutes: number }[],
): Set<string> {
  const keys = new Set<string>()
  for (const session of sessions) {
    if (session.durationMinutes >= MEANINGFUL_FOCUS_MINUTES) {
      keys.add(localDateKey(session.startedAt))
    }
  }
  return keys
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  const next = startOfDay(date)
  next.setDate(next.getDate() + days)
  return next
}

function earliestDate(
  sessions: { startedAt: string }[],
  holidayDates: Iterable<string>,
  now: Date,
): Date {
  let earliest = startOfDay(now)
  for (const session of sessions) {
    const day = startOfDay(new Date(session.startedAt))
    if (day < earliest) earliest = day
  }
  for (const key of holidayDates) {
    const [year, month, day] = key.split('-').map(Number)
    const holiday = new Date(year, (month ?? 1) - 1, day ?? 1)
    if (holiday < earliest) earliest = holiday
  }
  return earliest
}

export function calculateCurrentStreak(
  sessions: { startedAt: string; durationMinutes: number }[],
  holidayDates: Iterable<string> = [],
  now = new Date(),
): number {
  const focused = getFocusedDateKeys(sessions)
  const holidays = holidayDates instanceof Set ? holidayDates : new Set(holidayDates)
  const today = startOfDay(now)
  const todayKey = localDateKey(today)
  const earliest = earliestDate(sessions, holidays, now)

  let cursor = focused.has(todayKey) ? today : addDays(today, -1)
  let streak = 0

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i += 1) {
    if (cursor < addDays(earliest, -1)) break
    const key = localDateKey(cursor)
    if (focused.has(key)) {
      streak += 1
      cursor = addDays(cursor, -1)
      continue
    }
    if (isStreakExemptDay(cursor, holidays)) {
      cursor = addDays(cursor, -1)
      continue
    }
    break
  }

  return streak
}

export function calculateLongestStreak(
  sessions: { startedAt: string; durationMinutes: number }[],
  holidayDates: Iterable<string> = [],
  now = new Date(),
): number {
  const focused = getFocusedDateKeys(sessions)
  if (focused.size === 0) return 0

  const holidays = holidayDates instanceof Set ? holidayDates : new Set(holidayDates)
  const earliest = earliestDate(sessions, holidays, now)
  let cursor = earliest
  let run = 0
  let longest = 0

  while (cursor <= startOfDay(now)) {
    const key = localDateKey(cursor)
    if (focused.has(key)) {
      run += 1
      longest = Math.max(longest, run)
    } else if (!isStreakExemptDay(cursor, holidays)) {
      run = 0
    }
    cursor = addDays(cursor, 1)
  }

  return Math.max(longest, calculateCurrentStreak(sessions, holidays, now))
}
