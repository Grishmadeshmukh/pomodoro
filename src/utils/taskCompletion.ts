import type { Task } from '../types'

export const TASK_DELETE_AFTER_MS = 24 * 60 * 60 * 1000

export function hasOpenSubtasks(task: Pick<Task, 'subtasks'>): boolean {
  return task.subtasks.some((subtask) => !subtask.completed)
}

/**
 * A task with unfinished subtasks cannot stay completed.
 * completedAt is kept so the 24-hour deletion still runs after the task is
 * reopened to add more subtasks.
 */
export function withCompletableState(task: Task): Task {
  if (!task.completed || !hasOpenSubtasks(task)) return task
  return { ...task, completed: false }
}

export function isTaskExpired(
  task: Pick<Task, 'completedAt'>,
  now = Date.now(),
): boolean {
  if (!task.completedAt) return false
  const completedAt = new Date(task.completedAt).getTime()
  if (Number.isNaN(completedAt)) return false
  return now - completedAt >= TASK_DELETE_AFTER_MS
}
