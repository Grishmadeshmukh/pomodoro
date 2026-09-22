import type { FocusSession } from '../../types'
import { Tomato } from '../Tomato/Tomato'
import { formatSessionDuration } from '../../utils/dateUtils'

interface SessionHistoryListProps {
  sessions: FocusSession[]
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
                {SESSION_TYPE_LABELS[session.sessionType ?? 'focus']}
              </span>
              <span className="text-sm text-text-muted">
                — {formatSessionDuration(session.durationMinutes)}
              </span>
            </div>
            {session.tomatoesEarned != null && session.tomatoesEarned > 0 && (
              <span className="text-sm font-semibold text-tomato">
                <span className="inline-flex items-center gap-1">
                  +{session.tomatoesEarned}
                  <Tomato size={16} alt="" />
                </span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
