import type { PlanItem } from '../types'
import { loadItem, saveItem } from '../storage/localStorage'
import { addSavedRoutine } from './savedRoutineRepository'
import { ADDABLE_ROUTINES, isPermanentRoutine } from '../utils/defaultRoutine'
import { reindexPlanItems } from '../utils/planUtils'

const PLAN_KEY = 'pomodoro.v2.planItems'
const ROUTINES_RELEASED_KEY = 'pomodoro.v2.routinesStayInPicker'

export const PLAN_CHANGED_EVENT = 'pomodoro:plan-changed'

function notifyPlanChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PLAN_CHANGED_EVENT))
}

type PlanStore = Record<string, PlanItem[]>

function loadStore(): PlanStore {
  return loadItem<PlanStore>(PLAN_KEY, {})
}

function saveStore(store: PlanStore): PlanStore {
  saveItem(PLAN_KEY, store)
  return store
}

export function listStoredPlanDates(): string[] {
  return Object.keys(loadStore())
}

export function getStoredPlan(date: string): PlanItem[] | null {
  const items = loadStore()[date]
  if (!items) return null
  return [...items].sort((a, b) => a.order - b.order)
}

type LinkedTask = {
  id: string
  completed: boolean
  subtasks?: { id: string; completed: boolean }[]
}

/** Copy linked task and subtask completion onto one day's plan. Other days stay unchanged. */
export function syncLinkedTaskCompletion(date: string, tasks: LinkedTask[]): void {
  const plan = getStoredPlan(date)
  if (!plan) return
  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  let changed = false
  const next = plan.map((item) => {
    if (!item.taskId) return item
    const task = tasksById.get(item.taskId)
    if (!task) return item
    let completed = task.completed
    if (item.subtaskId) {
      const subtask = task.subtasks?.find((entry) => entry.id === item.subtaskId)
      if (!subtask) return item
      completed = subtask.completed
    }
    if (item.completed === completed) return item
    changed = true
    return { ...item, completed }
  })
  if (!changed) return
  savePlanForDate(date, next)
  notifyPlanChanged()
}

/** Move routine rows out of today's plan once. Their presets stay in the add dialog. */
function releaseRetainedRoutines(date: string): void {
  if (loadItem<boolean>(ROUTINES_RELEASED_KEY, false)) return
  const store = loadStore()
  const current = store[date]
  if (current?.some((item) => item.kind === 'routine')) {
    for (const item of current) {
      if (item.kind !== 'routine' || !item.routineKey) continue
      const title = item.title?.trim()
      if (!title || isPermanentRoutine(item.routineKey)) continue
      if (ADDABLE_ROUTINES.some((preset) => preset.key === item.routineKey)) continue
      addSavedRoutine({ key: item.routineKey, title, icon: item.icon })
    }
    store[date] = reindexPlanItems(current.filter((item) => item.kind !== 'routine'))
    saveStore(store)
  }
  saveItem(ROUTINES_RELEASED_KEY, true)
}

export function getOrCreatePlan(date: string): PlanItem[] {
  releaseRetainedRoutines(date)
  const current = getStoredPlan(date)
  return current ?? []
}

export function savePlanForDate(date: string, items: PlanItem[]): PlanItem[] {
  const store = loadStore()
  const next = reindexPlanItems(items.map((item) => ({ ...item, date })))
  store[date] = next
  saveStore(store)
  return next
}

export function removePlanItemsForTask(
  taskId: string,
  options?: { notify?: boolean },
): void {
  const store = loadStore()
  let changed = false

  for (const date of Object.keys(store)) {
    const next = store[date].filter((item) => item.taskId !== taskId)
    if (next.length !== store[date].length) {
      store[date] = reindexPlanItems(next)
      changed = true
    }
  }

  if (!changed) return
  saveStore(store)
  if (options?.notify !== false) notifyPlanChanged()
}

/** Drop plan rows whose subtask was removed from the task. */
export function pruneMissingSubtasks(task: {
  id: string
  subtasks: { id: string }[]
}): void {
  const valid = new Set(task.subtasks.map((subtask) => subtask.id))
  const store = loadStore()
  let changed = false

  for (const date of Object.keys(store)) {
    const next = store[date].filter((item) => {
      if (item.taskId !== task.id || !item.subtaskId) return true
      return valid.has(item.subtaskId)
    })
    if (next.length !== store[date].length) {
      store[date] = reindexPlanItems(next)
      changed = true
    }
  }

  if (!changed) return
  saveStore(store)
  notifyPlanChanged()
}
