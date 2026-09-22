export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

export type TomatoState =
  | 'idle'
  | 'focusing'
  | 'break'
  | 'completed'
  | 'celebration'

export type AppPage = 'home' | 'stats' | 'history'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  estimatedMinutes: number
  priority: TaskPriority
  completed: boolean
  subtasks: Subtask[]
}

export interface CompletedSession {
  id: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  sessionType: SessionType
  pointsEarned: number
}
