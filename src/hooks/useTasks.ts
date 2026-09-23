import { useCallback, useEffect, useState } from 'react'
import {
  PLAN_CHANGED_EVENT,
  removePlanItemsForTask,
} from '../repositories/planRepository'
import {
  getTasks,
  removeTask,
  upsertTask,
} from '../repositories/taskRepository'
import type { Task } from '../types'
import { hasOpenSubtasks, TASK_DELETE_AFTER_MS } from '../utils/taskCompletion'

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => sortTasks(getTasks()))

  const saveTask = useCallback((task: Task) => {
    setTasks(sortTasks(upsertTask(task)))
  }, [])

  useEffect(() => {
    let soonest = Infinity
    const now = Date.now()
    for (const task of tasks) {
      if (!task.completedAt) continue
      const due = new Date(task.completedAt).getTime() + TASK_DELETE_AFTER_MS
      if (due < soonest) soonest = due
    }
    if (!Number.isFinite(soonest)) return
    const id = window.setTimeout(() => {
      setTasks(sortTasks(getTasks()))
      window.dispatchEvent(new CustomEvent(PLAN_CHANGED_EVENT))
    }, Math.max(0, soonest - now))
    return () => window.clearTimeout(id)
  }, [tasks])

  const deleteTask = useCallback((id: string) => {
    removePlanItemsForTask(id)
    setTasks(sortTasks(removeTask(id)))
  }, [])

  const toggleTask = useCallback((id: string) => {
    const current = getTasks().find((task) => task.id === id)
    if (!current) return false
    if (!current.completed && hasOpenSubtasks(current)) return false
    const completed = !current.completed
    saveTask({
      ...current,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    })
    return completed
  }, [saveTask])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    const current = getTasks().find((task) => task.id === taskId)
    if (!current) return false
    const subtask = current.subtasks.find((item) => item.id === subtaskId)
    if (!subtask) return false
    const completed = !subtask.completed
    saveTask({
      ...current,
      subtasks: current.subtasks.map((item) => {
        if (item.id !== subtaskId) return item
        return {
          ...item,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
        }
      }),
    })
    return completed
  }, [saveTask])

  return {
    tasks,
    saveTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
  }
}
