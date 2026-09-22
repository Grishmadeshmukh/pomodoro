import type { DailyProgress } from '../types'
import { loadItem, saveItem } from '../storage/localStorage'

const FLAGS_KEY = 'pomodoro.v1.dailyFlags'
const ABANDON_KEY = 'pomodoro.v1.abandonCount'

export interface DailyFlags {
  date: string
  holiday: boolean
  goldenTomato: boolean
  /** Set once the calendar day has ended and the reward can no longer change. */
  goldenSettled?: boolean
}

interface AbandonCount {
  date: string
  count: number
}

function getFlags(): DailyFlags[] {
  return loadItem<DailyFlags[]>(FLAGS_KEY, [])
}

function saveFlags(flags: DailyFlags[]): DailyFlags[] {
  saveItem(FLAGS_KEY, flags)
  return flags
}

export function getDailyFlags(date: string): DailyFlags {
  return (
    getFlags().find((entry) => entry.date === date) ?? {
      date,
      holiday: false,
      goldenTomato: false,
    }
  )
}

export function getHolidayDates(): string[] {
  return getFlags().filter((entry) => entry.holiday).map((entry) => entry.date)
}

export function getGoldenTomatoDates(): string[] {
  return getFlags()
    .filter((entry) => entry.goldenTomato)
    .map((entry) => entry.date)
}

function upsertFlags(date: string, patch: Partial<DailyFlags>): DailyFlags {
  const flags = getFlags()
  const index = flags.findIndex((entry) => entry.date === date)
  const next: DailyFlags = {
    ...(index >= 0 ? flags[index] : { date, holiday: false, goldenTomato: false }),
    ...patch,
    date,
  }
  if (index >= 0) flags[index] = next
  else flags.push(next)
  saveFlags(flags)
  return next
}

export function setHoliday(date: string, holiday: boolean): DailyFlags {
  return upsertFlags(date, { holiday })
}

export function settleGoldenTomato(date: string, earned: boolean): DailyFlags {
  return upsertFlags(date, { goldenTomato: earned, goldenSettled: true })
}

/** Drop a same-day award that was saved before the day finished. */
export function revokeProvisionalGoldenTomato(date: string): boolean {
  const current = getFlags().find((entry) => entry.date === date)
  if (!current || current.goldenSettled || !current.goldenTomato) return false
  upsertFlags(date, { goldenTomato: false })
  return true
}

export function getAbandonCount(date: string): number {
  const stored = loadItem<AbandonCount | null>(ABANDON_KEY, null)
  if (!stored || stored.date !== date) return 0
  return stored.count
}

export function incrementAbandonCount(date: string): number {
  const count = getAbandonCount(date) + 1
  saveItem(ABANDON_KEY, { date, count } satisfies AbandonCount)
  return count
}

export function toDailyProgress(
  date: string,
  totals: { focusMinutes: number; tomatoes: number },
  plan: { completed: number; total: number },
  tasks: { completed: number; total: number },
): DailyProgress {
  const flags = getDailyFlags(date)
  return {
    date,
    focusMinutes: totals.focusMinutes,
    tomatoes: totals.tomatoes,
    tasksCompleted: tasks.completed,
    tasksTotal: tasks.total,
    planItemsCompleted: plan.completed,
    planItemsTotal: plan.total,
    goldenTomato: flags.goldenTomato,
    holiday: flags.holiday,
  }
}
