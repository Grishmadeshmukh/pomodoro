import { useCallback, useState } from 'react'
import {
  addFocusSession,
  getFocusSessions,
} from '../repositories/focusSessionRepository'
import type { FocusSession } from '../types'

export function useFocusSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    getFocusSessions(),
  )

  const addSession = useCallback((session: FocusSession) => {
    setSessions(addFocusSession(session))
  }, [])

  return { sessions, addSession }
}
