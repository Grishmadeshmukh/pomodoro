import { useCallback, useState } from 'react'
import { removePlanItemsForTask } from '../repositories/planRepository'
import {
  getTasks,
  removeTask,
  upsertTask,
} from '../repositories/taskRepository'
import type { Task } from '../types'
import { hasOpenSubtasks } from '../utils/taskCompletion'

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
    if (!current) return
    saveTask({
      ...current,
      subtasks: current.subtasks.map((subtask) => {
        if (subtask.id !== subtaskId) return subtask
        const completed = !subtask.completed
        return {
          ...subtask,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
        }
      }),
    })
  }, [saveTask])

  return {
    tasks,
    saveTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
  }
}
