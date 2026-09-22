export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

export interface FocusSession {
  id: string
  taskId?: string
  startedAt: string
  endedAt?: string
  durationMinutes: number
  completed: boolean
  tomatoesEarned?: number
  sessionType?: SessionType
}
