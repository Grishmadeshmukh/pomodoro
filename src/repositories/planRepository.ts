import type { PlanItem } from '../types'
import { loadItem, saveItem } from '../storage/localStorage'
import { getSavedRoutines } from './savedRoutineRepository'
import {
  createDefaultRoutineItems,
  ensurePermanentRoutines,
} from '../utils/createPlanItems'
import { reindexPlanItems } from '../utils/planUtils'

const PLAN_KEY = 'pomodoro.v2.planItems'

type PlanStore = Record<string, PlanItem[]>

function loadStore(): PlanStore {
  return loadItem<PlanStore>(PLAN_KEY, {})
}

function saveStore(store: PlanStore): PlanStore {
  saveItem(PLAN_KEY, store)
  return store
}

export function getOrCreatePlan(date: string): PlanItem[] {
  const store = loadStore()
  const current = date in store ? store[date] : undefined
  const next = current
    ? ensurePermanentRoutines(date, current)
    : createDefaultRoutineItems(date, getSavedRoutines())
  const changed =
    !current ||
    next.length !== current.length ||
    next.some(
      (item, index) =>
        item.routineKey !== current[index]?.routineKey ||
        item.icon !== current[index]?.icon ||
        item.title !== current[index]?.title,
    )

  if (changed) {
    store[date] = next
    saveStore(store)
  }

  return [...store[date]].sort((a, b) => a.order - b.order)
}

export function savePlanForDate(date: string, items: PlanItem[]): PlanItem[] {
  const store = loadStore()
  const next = ensurePermanentRoutines(
    date,
    items.map((item) => ({ ...item, date })),
  )
  store[date] = next
  saveStore(store)
  return next
}

export function removePlanItemsForTask(taskId: string): void {
  const store = loadStore()
  let changed = false

  for (const date of Object.keys(store)) {
    const next = store[date].filter((item) => item.taskId !== taskId)
    if (next.length !== store[date].length) {
      store[date] = reindexPlanItems(next)
      changed = true
    }
  }

  if (changed) saveStore(store)
}
