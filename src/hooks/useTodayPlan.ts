import { useCallback, useState } from 'react'
import {
  getOrCreatePlan,
  savePlanForDate,
} from '../repositories/planRepository'
import {
  addSavedRoutine,
  removeSavedRoutine,
} from '../repositories/savedRoutineRepository'
import type { PlanItem, Task } from '../types'
import { createRoutinePlanItem } from '../utils/createPlanItems'
import { localDateKey } from '../utils/dateUtils'
import type { RoutinePreset } from '../utils/defaultRoutine'
import {
  inferRoutineIcon,
  isPermanentPlanItem,
  isPermanentRoutine,
} from '../utils/defaultRoutine'
import { insertPlanItem, movePlanItem } from '../utils/planUtils'

function todayKey(): string {
  return localDateKey(new Date())
}

export function useTodayPlan() {
  const date = todayKey()
  const [items, setItems] = useState<PlanItem[]>(() => getOrCreatePlan(date))

  const persist = useCallback(
    (next: PlanItem[]) => {
      setItems(savePlanForDate(date, next))
    },
    [date],
  )

  const addRoutine = useCallback(
    (preset: RoutinePreset, atIndex: number) => {
      persist(insertPlanItem(items, createRoutinePlanItem(date, preset, 0), atIndex))
      if (!isPermanentRoutine(preset.key)) addSavedRoutine(preset)
    },
    [date, items, persist],
  )

  const addCustomRoutine = useCallback(
    (title: string, atIndex: number) => {
      const trimmed = title.trim()
      if (!trimmed) return
      addRoutine(
        {
          key: crypto.randomUUID(),
          title: trimmed,
          icon: inferRoutineIcon(trimmed),
        },
        atIndex,
      )
    },
    [addRoutine],
  )

  const addTask = useCallback(
    (task: Task, atIndex: number) => {
      persist(
        insertPlanItem(
          items,
          {
            id: crypto.randomUUID(),
            date,
            kind: 'task',
            taskId: task.id,
            title: task.title,
            completed: false,
          },
          atIndex,
        ),
      )
    },
    [date, items, persist],
  )

  const addPlanOnlyTask = useCallback(
    (title: string, atIndex: number) => {
      persist(
        insertPlanItem(
          items,
          {
            id: crypto.randomUUID(),
            date,
            kind: 'task',
            title: title.trim(),
            completed: false,
          },
          atIndex,
        ),
      )
    },
    [date, items, persist],
  )

  const appendTask = useCallback(
    (task: Task) => {
      addTask(task, items.length)
    },
    [addTask, items.length],
  )

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      persist(movePlanItem(items, fromIndex, toIndex))
    },
    [items, persist],
  )

  const removeItem = useCallback(
    (id: string) => {
      const removing = items.find((item) => item.id === id)
      if (removing && isPermanentPlanItem(removing)) return
      const remaining = items.filter((item) => item.id !== id)
      persist(remaining)
      if (
        removing?.routineKey &&
        !isPermanentRoutine(removing.routineKey) &&
        !remaining.some((item) => item.routineKey === removing.routineKey)
      ) {
        removeSavedRoutine(removing.routineKey)
      }
    },
    [items, persist],
  )

  const toggleLocalItem = useCallback(
    (id: string) => {
      const current = items.find((item) => item.id === id)
      if (!current) return false
      const completed = !(current.completed ?? false)
      persist(
        items.map((item) => (item.id === id ? { ...item, completed } : item)),
      )
      return completed
    },
    [items, persist],
  )

  const setItemCompleted = useCallback(
    (id: string, completed: boolean) => {
      persist(
        items.map((item) => (item.id === id ? { ...item, completed } : item)),
      )
    },
    [items, persist],
  )

  const renameItem = useCallback(
    (id: string, title: string) => {
      persist(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                title: title.trim(),
                icon: item.kind === 'routine' ? inferRoutineIcon(title) ?? item.icon : item.icon,
              }
            : item,
        ),
      )
    },
    [items, persist],
  )

  const planTaskIds = new Set(
    items
      .filter((item) => item.kind === 'task' && item.taskId)
      .map((item) => item.taskId as string),
  )

  const routineKeys = new Set(
    items
      .filter((item) => item.routineKey)
      .map((item) => item.routineKey as string),
  )

  return {
    date,
    items,
    planTaskIds,
    routineKeys,
    addRoutine,
    addCustomRoutine,
    addTask,
    addPlanOnlyTask,
    appendTask,
    moveItem,
    removeItem,
    toggleLocalItem,
    setItemCompleted,
    renameItem,
  }
}
