import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getOrCreatePlan,
  getStoredPlan,
  PLAN_CHANGED_EVENT,
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
  const itemsRef = useRef(items)
  itemsRef.current = items

  const persist = useCallback(
    (next: PlanItem[]) => {
      itemsRef.current = next
      setItems(savePlanForDate(date, next))
    },
    [date],
  )

  useEffect(() => {
    function refresh() {
      const next = getStoredPlan(date) ?? getOrCreatePlan(date)
      itemsRef.current = next
      setItems(next)
    }
    window.addEventListener(PLAN_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(PLAN_CHANGED_EVENT, refresh)
  }, [date])

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
      const current = itemsRef.current
      persist(
        insertPlanItem(
          current,
          {
            id: crypto.randomUUID(),
            date,
            kind: 'task',
            taskId: task.id,
            title: task.title,
            completed: task.completed,
          },
          atIndex,
        ),
      )
    },
    [date, persist],
  )

  const addSubtask = useCallback(
    (task: Task, subtaskId: string, atIndex: number) => {
      const current = itemsRef.current
      const subtask = task.subtasks.find((item) => item.id === subtaskId)
      if (!subtask) return
      persist(
        insertPlanItem(
          current,
          {
            id: crypto.randomUUID(),
            date,
            kind: 'task',
            taskId: task.id,
            subtaskId,
            title: subtask.title,
            completed: subtask.completed,
          },
          atIndex,
        ),
      )
    },
    [date, persist],
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

  const appendSubtask = useCallback(
    (task: Task, subtaskId: string) => {
      addSubtask(task, subtaskId, items.length)
    },
    [addSubtask, items.length],
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
      const current = itemsRef.current
      const target = current.find((item) => item.id === id)
      if (!target) return
      persist(
        current.map((item) => {
          const sameSubtask = Boolean(target.subtaskId) && item.subtaskId === target.subtaskId
          const sameTask =
            !target.subtaskId &&
            Boolean(target.taskId) &&
            item.taskId === target.taskId &&
            !item.subtaskId
          if (item.id === id || sameSubtask || sameTask) return { ...item, completed }
          return item
        }),
      )
    },
    [persist],
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
      .filter((item) => item.kind === 'task' && item.taskId && !item.subtaskId)
      .map((item) => item.taskId as string),
  )

  const planSubtaskIds = new Set(
    items
      .filter((item) => item.subtaskId)
      .map((item) => item.subtaskId as string),
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
    planSubtaskIds,
    routineKeys,
    addRoutine,
    addCustomRoutine,
    addTask,
    addSubtask,
    addPlanOnlyTask,
    appendTask,
    appendSubtask,
    moveItem,
    removeItem,
    toggleLocalItem,
    setItemCompleted,
    renameItem,
  }
}
