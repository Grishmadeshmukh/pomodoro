import type { Task } from '../types'
import { loadItem, saveItem } from '../storage/localStorage'
import { localDateKey } from '../utils/dateUtils'
import { isTaskExpired, withCompletableState } from '../utils/taskCompletion'
import {
  pruneMissingSubtasks,
  removePlanItemsForTask,
  syncLinkedTaskCompletion,
} from './planRepository'

function mirrorTasksOntoTodayPlan(tasks: Task[]): void {
  syncLinkedTaskCompletion(
    localDateKey(new Date()),
    tasks.map((task) => ({
      id: task.id,
      completed: task.completed,
      subtasks: task.subtasks.map((subtask) => ({
        id: subtask.id,
        completed: subtask.completed,
      })),
    })),
  )
}

function dropExpiredTasks(tasks: Task[]): Task[] {
  const expired = tasks.filter((task) => isTaskExpired(task))
  if (expired.length === 0) return tasks
  for (const task of expired) removePlanItemsForTask(task.id, { notify: false })
  const expiredIds = new Set(expired.map((task) => task.id))
  return saveTasks(tasks.filter((task) => !expiredIds.has(task.id)))
}

const TASKS_KEY = 'pomodoro.v1.tasks'

function withStableOrder(tasks: Task[]): Task[] {
  if (tasks.every((task) => task.order !== undefined)) return tasks
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  const open = sorted.filter((task) => !task.completed)
  const done = sorted.filter((task) => task.completed)
  return [
    ...open.map((task, index) => ({ ...task, order: task.order ?? index })),
    ...done.map((task, index) => ({ ...task, order: task.order ?? index })),
  ]
}

export function getTasks(): Task[] {
  const tasks = loadItem<Task[]>(TASKS_KEY, [])
  const normalized = withStableOrder(tasks.map(withCompletableState))
  const normalizedChanged = normalized.some((task, index) => task !== tasks[index])
  if (normalizedChanged) {
    saveItem(TASKS_KEY, normalized)
    mirrorTasksOntoTodayPlan(normalized)
  }
  return dropExpiredTasks(normalized)
}

export function saveTasks(tasks: Task[]): Task[] {
  saveItem(TASKS_KEY, tasks)
  return tasks
}

function orderAtStart(tasks: Task[], completed: boolean): number {
  const peers = tasks.filter((task) => task.completed === completed)
  if (peers.length === 0) return 0
  return Math.min(...peers.map((task) => task.order ?? 0)) - 1
}

export function upsertTask(task: Task): Task[] {
  const tasks = getTasks()
  const index = tasks.findIndex((item) => item.id === task.id)
  const saved = withCompletableState(
    index === -1 && task.order === undefined
      ? { ...task, order: orderAtStart(tasks, task.completed) }
      : task,
  )
  const next = index === -1 ? [saved, ...tasks] : [...tasks]
  if (index !== -1) next[index] = saved
  const stored = saveTasks(next)
  mirrorTasksOntoTodayPlan(stored)
  pruneMissingSubtasks(saved)
  return stored
}

export function reorderTasks(orderedIds: string[]): Task[] {
  const rank = new Map(orderedIds.map((id, index) => [id, index]))
  const next = getTasks().map((task) =>
    rank.has(task.id) ? { ...task, order: rank.get(task.id) } : task,
  )
  return saveTasks(next)
}

export function removeTask(id: string): Task[] {
  return saveTasks(getTasks().filter((task) => task.id !== id))
}
