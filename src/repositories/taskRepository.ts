import type { Task } from '../types'
import { loadItem, saveItem } from '../storage/localStorage'

const TASKS_KEY = 'pomodoro.v1.tasks'

export function getTasks(): Task[] {
  return loadItem<Task[]>(TASKS_KEY, [])
}

export function saveTasks(tasks: Task[]): Task[] {
  saveItem(TASKS_KEY, tasks)
  return tasks
}

export function upsertTask(task: Task): Task[] {
  const tasks = getTasks()
  const index = tasks.findIndex((item) => item.id === task.id)
  if (index === -1) return saveTasks([task, ...tasks])
  const next = [...tasks]
  next[index] = task
  return saveTasks(next)
}

export function removeTask(id: string): Task[] {
  return saveTasks(getTasks().filter((task) => task.id !== id))
}
