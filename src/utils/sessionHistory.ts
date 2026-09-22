import type { FocusSession } from '../types'
import { localDateKey } from './dateUtils'

export function groupFocusSessions(
  sessions: FocusSession[],
): { label: string; sessions: FocusSession[] }[] {
  const today = localDateKey(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = localDateKey(yesterdayDate)

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )

  const grouped = new Map<string, FocusSession[]>()
  for (const session of sorted) {
    const key = localDateKey(session.startedAt)
    const list = grouped.get(key) ?? []
    list.push(session)
    grouped.set(key, list)
  }

  return [...grouped.entries()].map(([key, daySessions]) => ({
    label: key === today ? 'Today' : key === yesterday ? 'Yesterday' : key,
    sessions: daySessions,
  }))
}

function sumSessions(
  sessions: FocusSession[],
): { focusMinutes: number; tomatoes: number } {
  return sessions.reduce(
    (totals, session) => ({
      focusMinutes: totals.focusMinutes + session.durationMinutes,
      tomatoes: totals.tomatoes + (session.tomatoesEarned ?? 0),
    }),
    { focusMinutes: 0, tomatoes: 0 },
  )
}

export function sumTodayProgress(
  sessions: FocusSession[],
  now = new Date(),
): { focusMinutes: number; tomatoes: number } {
  const today = localDateKey(now)
  return sumSessions(
    sessions.filter((session) => localDateKey(session.startedAt) === today),
  )
}

export function sumAllProgress(
  sessions: FocusSession[],
): { focusMinutes: number; tomatoes: number } {
  return sumSessions(sessions)
}

export function weekStartKey(now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const mondayOffset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - mondayOffset)
  return localDateKey(date)
}

export function monthStartKey(now = new Date()): string {
  return localDateKey(new Date(now.getFullYear(), now.getMonth(), 1))
}

export function sumProgressSince(
  sessions: FocusSession[],
  startKey: string,
  now = new Date(),
): { focusMinutes: number; tomatoes: number } {
  const endKey = localDateKey(now)
  return sumSessions(
    sessions.filter((session) => {
      const key = localDateKey(session.startedAt)
      return key >= startKey && key <= endKey
    }),
  )
}

export function averageSessionMinutes(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0
  const total = sessions.reduce((sum, session) => sum + session.durationMinutes, 0)
  return total / sessions.length
}
