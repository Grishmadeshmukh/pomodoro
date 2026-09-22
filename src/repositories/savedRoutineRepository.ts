import type { RoutinePreset } from '../utils/defaultRoutine'
import { loadItem, saveItem } from '../storage/localStorage'

const SAVED_ROUTINES_KEY = 'pomodoro.v1.savedRoutines'

export function getSavedRoutines(): RoutinePreset[] {
  return loadItem<RoutinePreset[]>(SAVED_ROUTINES_KEY, [])
}

export function saveSavedRoutines(routines: RoutinePreset[]): RoutinePreset[] {
  saveItem(SAVED_ROUTINES_KEY, routines)
  return routines
}

export function addSavedRoutine(routine: RoutinePreset): RoutinePreset[] {
  const current = getSavedRoutines()
  if (current.some((item) => item.key === routine.key)) return current
  return saveSavedRoutines([...current, routine])
}

export function removeSavedRoutine(key: string): RoutinePreset[] {
  return saveSavedRoutines(getSavedRoutines().filter((item) => item.key !== key))
}
