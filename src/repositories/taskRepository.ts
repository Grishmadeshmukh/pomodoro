import type { Task } from '../types'
import { loadItem, saveItem } from '../storage/localStorage'
import { localDateKey } from '../utils/dateUtils'
import { withCompletableState } from '../utils/taskCompletion'
import { syncLinkedTaskCompletion } from './planRepository'

function mirrorTasksOntoTodayPlan(tasks: Task[]): void {
  syncLinkedTaskCompletion(
    localDateKey(new Date()),
    tasks.map((task) => ({ id: task.id, completed: task.completed })),
  )
}

const TASKS_KEY = 'pomodoro.v1.tasks'

export function getTasks(): Task[] {
  const tasks = loadItem<Task[]>(TASKS_KEY, [])
  const normalized = tasks.map(withCompletableState)
  if (normalized.some((task, index) => task !== tasks[index])) {
    saveItem(TASKS_KEY, normalized)
    mirrorTasksOntoTodayPlan(normalized)
  }
  return normalized
}

export function saveTasks(tasks: Task[]): Task[] {
  saveItem(TASKS_KEY, tasks)
  return tasks
}

export function upsertTask(task: Task): Task[] {
  const saved = withCompletableState(task)
  const tasks = getTasks()
  const index = tasks.findIndex((item) => item.id === saved.id)
  const next = index === -1 ? [saved, ...tasks] : [...tasks]
  if (index !== -1) next[index] = saved
  const stored = saveTasks(next)
  mirrorTasksOntoTodayPlan(stored)
  return stored
}

export function removeTask(id: string): Task[] {
  return saveTasks(getTasks().filter((task) => task.id !== id))
}
