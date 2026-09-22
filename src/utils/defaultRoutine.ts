import type { RoutineIcon } from '../types'

export type { RoutineIcon }

export interface RoutinePreset {
  key: string
  title: string
  icon?: RoutineIcon
}

export const PERMANENT_ROUTINES: RoutinePreset[] = [
  { key: 'lunch', title: 'Lunch', icon: 'meals' },
  { key: 'dinner', title: 'Dinner', icon: 'meals' },
]

export const ADDABLE_ROUTINES: RoutinePreset[] = [
  { key: 'gym', title: 'Gym', icon: 'gym' },
  { key: 'work', title: 'Work', icon: 'work' },
]

export const ROUTINE_ICON_SRC: Record<RoutineIcon, string> = {
  meals: '/meals.svg',
  gym: '/gym.svg',
  work: '/work.svg',
}

export function inferRoutineIcon(title: string): RoutineIcon | undefined {
  const normalized = title.trim().toLowerCase()
  if (
    normalized.includes('lunch') ||
    normalized.includes('dinner') ||
    normalized.includes('breakfast') ||
    normalized.includes('meal')
  ) {
    return 'meals'
  }
  if (normalized.includes('gym') || normalized.includes('workout')) return 'gym'
  if (normalized.includes('work')) return 'work'
  return undefined
}

export function isPermanentRoutine(key?: string): boolean {
  return key === 'lunch' || key === 'dinner'
}

export function matchesPermanentRoutine(
  item: { kind?: string; routineKey?: string; title?: string },
  key: string,
): boolean {
  if (item.kind && item.kind !== 'routine') return false
  if (item.routineKey === key) return true
  const preset = PERMANENT_ROUTINES.find((entry) => entry.key === key)
  return Boolean(preset && item.title?.trim().toLowerCase() === preset.title.toLowerCase())
}

export function isPermanentPlanItem(item: {
  kind?: string
  routineKey?: string
  title?: string
}): boolean {
  return PERMANENT_ROUTINES.some((preset) => matchesPermanentRoutine(item, preset.key))
}
