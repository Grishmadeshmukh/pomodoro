import type { FocusSession } from '../types'
import { loadItem, saveItem } from '../storage/localStorage'

const SESSIONS_KEY = 'pomodoro.v1.focusSessions'

export function getFocusSessions(): FocusSession[] {
  return loadItem<FocusSession[]>(SESSIONS_KEY, [])
}

export function saveFocusSessions(sessions: FocusSession[]): void {
  saveItem(SESSIONS_KEY, sessions)
}

export function addFocusSession(session: FocusSession): FocusSession[] {
  const sessions = [session, ...getFocusSessions()]
  saveFocusSessions(sessions)
  return sessions
}
