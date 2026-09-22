import { EmptyState } from '../components/Common/EmptyState'
import { SessionHistoryList } from '../components/History/SessionHistoryList'
import { useFocusSessions } from '../hooks/useFocusSessions'
import { groupFocusSessions } from '../utils/sessionHistory'

export function HistoryPage() {
  const { sessions } = useFocusSessions()
  const grouped = groupFocusSessions(sessions)

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="No focus history yet."
        description="Start a session to grow your first tomatoes."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-text">History</h2>
        <p className="mt-1 text-sm text-text-muted">
          Focus sessions and tomatoes over time
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {grouped.map(({ label, sessions: daySessions }) => (
          <SessionHistoryList
            key={label}
            groupLabel={label}
            sessions={daySessions}
          />
        ))}
      </div>
    </div>
  )
}
