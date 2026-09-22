import type { PlanItem } from '../types'
import type { RoutinePreset } from './defaultRoutine'
import { PERMANENT_ROUTINES, matchesPermanentRoutine } from './defaultRoutine'
import { reindexPlanItems } from './planUtils'

export function createRoutinePlanItem(
  date: string,
  preset: RoutinePreset,
  order: number,
): PlanItem {
  return {
    id: crypto.randomUUID(),
    date,
    order,
    kind: 'routine',
    title: preset.title,
    completed: false,
    routineKey: preset.key,
    icon: preset.icon,
  }
}

export function createDefaultRoutineItems(
  date: string,
  extraRoutines: RoutinePreset[] = [],
): PlanItem[] {
  const extras = extraRoutines.filter(
    (extra) => !PERMANENT_ROUTINES.some((item) => item.key === extra.key),
  )
  return [...PERMANENT_ROUTINES, ...extras].map((preset, index) =>
    createRoutinePlanItem(date, preset, index),
  )
}

export function ensurePermanentRoutines(date: string, items: PlanItem[]): PlanItem[] {
  const next = [...items]
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const preset = PERMANENT_ROUTINES.find((entry) =>
        matchesPermanentRoutine(item, entry.key),
      )
      if (!preset) return item
      return {
        ...item,
        routineKey: preset.key,
        icon: item.icon ?? preset.icon,
        title: item.title?.trim() ? item.title : preset.title,
      }
    })

  const missing = PERMANENT_ROUTINES.filter(
    (preset) => !next.some((item) => matchesPermanentRoutine(item, preset.key)),
  )
  if (missing.length === 0) return reindexPlanItems(next)

  return reindexPlanItems([
    ...next,
    ...missing.map((preset) => createRoutinePlanItem(date, preset, 0)),
  ])
}
