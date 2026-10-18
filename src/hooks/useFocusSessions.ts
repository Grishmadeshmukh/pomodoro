import { useCallback, useEffect, useState } from 'react'
import {
  addFocusSession,
  getFocusSessions,
} from '../repositories/focusSessionRepository'
import { DATA_SYNCED_EVENT } from '../sync/syncEngine'
import type { FocusSession } from '../types'

export function useFocusSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    getFocusSessions(),
  )

  useEffect(() => {
    const refresh = () => setSessions(getFocusSessions())
    window.addEventListener(DATA_SYNCED_EVENT, refresh)
    return () => window.removeEventListener(DATA_SYNCED_EVENT, refresh)
  }, [])

  const addSession = useCallback((session: FocusSession) => {
    setSessions(addFocusSession(session))
  }, [])

  return { sessions, addSession }
}
