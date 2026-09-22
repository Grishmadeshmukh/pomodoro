import type { Task } from '../types'

export function hasOpenSubtasks(task: Pick<Task, 'subtasks'>): boolean {
  return task.subtasks.some((subtask) => !subtask.completed)
}

/** A task with unfinished subtasks cannot stay completed. */
export function withCompletableState(task: Task): Task {
  if (!task.completed || !hasOpenSubtasks(task)) return task
  return { ...task, completed: false, completedAt: undefined }
}
