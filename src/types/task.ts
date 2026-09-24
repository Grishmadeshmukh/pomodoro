export type TaskPriority = 'low' | 'medium' | 'high'

export interface Subtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  completedAt?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  deadline?: string
  completed: boolean
  subtasks: Subtask[]
  createdAt: string
  completedAt?: string
  order?: number
}
