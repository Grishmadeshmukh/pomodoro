import type { CompletedSession } from '../../types/pomodoro'
import { Tomato } from '../Tomato/Tomato'

interface SessionHistoryListProps {
  sessions: CompletedSession[]
  groupLabel: string
}

const SESSION_TYPE_LABELS = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
} as const

export function SessionHistoryList({
  sessions,
  groupLabel,
}: SessionHistoryListProps) {
  if (sessions.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-text-muted">{groupLabel}</h3>
      <div className="flex flex-col gap-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Tomato size={18} alt="" />
              <span className="text-sm font-medium text-text">
                {SESSION_TYPE_LABELS[session.sessionType]}
              </span>
              <span className="text-sm text-text-muted">
                — {session.durationMinutes} min
              </span>
            </div>
            {session.pointsEarned > 0 && (
              <span className="text-sm font-semibold text-tomato">
                +{session.pointsEarned} pts
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
