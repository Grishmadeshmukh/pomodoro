import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusSession, TomatoState } from '../types'
import {
  getAbandonCount,
  incrementAbandonCount,
} from '../repositories/dailyProgressRepository'
import { loadItem, removeItem, saveItem } from '../storage/localStorage'
import { localDateKey, snapDurationMs } from '../utils/dateUtils'
import { calculateTomatoes } from '../utils/tomatoCalculations'
import {
  JOYOUS_HOLD_MS,
  SLEEPY_AFTER_MS,
  getTomatoState,
  type SessionOutcome,
} from '../utils/tomatoEmotion'

export type TimerStatus = 'idle' | 'running' | 'paused'

export const FOCUS_DURATION_MS = 25 * 60 * 1000
const ACTIVE_TIMER_KEY = 'pomodoro.v1.activeTimer'
const PREFERRED_DURATION_KEY = 'pomodoro.v1.preferredDurationMs'
const TICK_MS = 250
const MIN_PERSIST_MS = 1000

interface PersistedTimer {
  status: TimerStatus
  durationMs: number
  accumulatedMs: number
  segmentStartedAt: number | null
  sessionStartedAt: string | null
}

function getPreferredDurationMs(): number {
  const stored = loadItem<number | null>(PREFERRED_DURATION_KEY, null)
  if (typeof stored === 'number' && Number.isFinite(stored)) {
    return snapDurationMs(stored)
  }
  return FOCUS_DURATION_MS
}

function idleTimer(): PersistedTimer {
  return {
    status: 'idle',
    durationMs: getPreferredDurationMs(),
    accumulatedMs: 0,
    segmentStartedAt: null,
    sessionStartedAt: null,
  }
}

function getElapsedMs(timer: PersistedTimer, now: number): number {
  const currentSegment =
    timer.status === 'running' && timer.segmentStartedAt != null
      ? Math.max(0, now - timer.segmentStartedAt)
      : 0
  return Math.min(timer.durationMs, Math.max(0, timer.accumulatedMs + currentSegment))
}

function toFocusSession(
  timer: PersistedTimer,
  elapsedMs: number,
  fullyCompleted: boolean,
): FocusSession {
  const startedAt = timer.sessionStartedAt ?? new Date().toISOString()
  const durationMinutes = elapsedMs / 60000
  return {
    id: crypto.randomUUID(),
    startedAt,
    endedAt: new Date().toISOString(),
    durationMinutes,
    completed: fullyCompleted,
    tomatoesEarned: calculateTomatoes(durationMinutes, new Date(startedAt)),
    sessionType: 'focus',
  }
}

interface UseTimerOptions {
  onSessionEnd?: (session: FocusSession) => void
}

export function useTimer({ onSessionEnd }: UseTimerOptions = {}) {
  const [timer, setTimer] = useState<PersistedTimer>(
    () => loadItem<PersistedTimer | null>(ACTIVE_TIMER_KEY, null) ?? idleTimer(),
  )
  const [now, setNow] = useState(() => Date.now())
  const [outcome, setOutcome] = useState<SessionOutcome>('none')
  const [outcomeAt, setOutcomeAt] = useState(0)
  const [idleSince, setIdleSince] = useState(() => Date.now())
  const [abandonCount, setAbandonCount] = useState(() =>
    getAbandonCount(localDateKey(new Date())),
  )
  const timerRef = useRef(timer)
  const onSessionEndRef = useRef(onSessionEnd)
  const finishingRef = useRef(false)

  timerRef.current = timer
  onSessionEndRef.current = onSessionEnd

  const elapsedMs = getElapsedMs(timer, now)
  const remainingMs = Math.max(0, timer.durationMs - elapsedMs)

  const persistTimer = useCallback((next: PersistedTimer) => {
    setTimer(next)
    if (next.status === 'idle') {
      removeItem(ACTIVE_TIMER_KEY)
      return
    }
    saveItem(ACTIVE_TIMER_KEY, next)
  }, [])

  const recordOutcome = useCallback((next: SessionOutcome, abandoned: boolean) => {
    const timestamp = Date.now()
    setOutcome(next)
    setOutcomeAt(timestamp)
    setIdleSince(timestamp)
    if (abandoned) {
      setAbandonCount(incrementAbandonCount(localDateKey(new Date())))
    }
  }, [])

  const finishSession = useCallback(
    (fullyCompleted: boolean) => {
      if (finishingRef.current) return
      finishingRef.current = true
      const current = timerRef.current
      const elapsed = getElapsedMs(current, Date.now())
      if (elapsed >= MIN_PERSIST_MS && current.sessionStartedAt) {
        onSessionEndRef.current?.(toFocusSession(current, elapsed, fullyCompleted))
        recordOutcome(fullyCompleted ? 'completed' : 'abandoned', !fullyCompleted)
      }
      persistTimer(idleTimer())
      finishingRef.current = false
    },
    [persistTimer, recordOutcome],
  )

  useEffect(() => {
    if (timer.status !== 'running') return

    const tick = () => setNow(Date.now())
    tick()
    const id = window.setInterval(tick, TICK_MS)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [timer.status])

  useEffect(() => {
    if (timer.status !== 'running') return
    if (elapsedMs < timer.durationMs) return
    finishSession(true)
  }, [elapsedMs, finishSession, timer.durationMs, timer.status])

  useEffect(() => {
    if (timer.status === 'running') return
    const remaining = SLEEPY_AFTER_MS + JOYOUS_HOLD_MS - (Date.now() - idleSince)
    if (remaining <= 0) return
    const id = window.setInterval(() => setNow(Date.now()), 400)
    const stop = window.setTimeout(() => {
      window.clearInterval(id)
      setNow(Date.now())
    }, remaining + 50)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(stop)
    }
  }, [idleSince, timer.status])

  const start = useCallback(() => {
    const current = timerRef.current
    const timestamp = Date.now()
    setOutcome('none')
    persistTimer({
      status: 'running',
      durationMs: current.durationMs,
      accumulatedMs: 0,
      segmentStartedAt: timestamp,
      sessionStartedAt: new Date(timestamp).toISOString(),
    })
    setNow(timestamp)
  }, [persistTimer])

  const pause = useCallback(() => {
    const current = timerRef.current
    if (current.status !== 'running') return
    const timestamp = Date.now()
    persistTimer({
      ...current,
      status: 'paused',
      accumulatedMs: getElapsedMs(current, timestamp),
      segmentStartedAt: null,
    })
    setNow(timestamp)
  }, [persistTimer])

  const resume = useCallback(() => {
    const current = timerRef.current
    if (current.status !== 'paused') return
    const timestamp = Date.now()
    persistTimer({
      ...current,
      status: 'running',
      segmentStartedAt: timestamp,
    })
    setNow(timestamp)
  }, [persistTimer])

  const reset = useCallback(() => {
    const current = timerRef.current
    const elapsed = getElapsedMs(current, Date.now())
    if (elapsed >= MIN_PERSIST_MS && current.status !== 'idle') {
      recordOutcome('abandoned', true)
    }
    persistTimer(idleTimer())
    setNow(Date.now())
  }, [persistTimer, recordOutcome])

  const end = useCallback(() => {
    finishSession(false)
    setNow(Date.now())
  }, [finishSession])

  const setDuration = useCallback(
    (durationMs: number) => {
      const current = timerRef.current
      if (current.status !== 'idle') return
      const nextDuration = snapDurationMs(durationMs)
      saveItem(PREFERRED_DURATION_KEY, nextDuration)
      persistTimer({
        ...idleTimer(),
        durationMs: nextDuration,
      })
      setNow(Date.now())
    },
    [persistTimer],
  )

  const tomatoState: TomatoState = getTomatoState({
    status: timer.status,
    elapsedMs,
    idleMs: timer.status === 'idle' ? Math.max(0, now - idleSince) : 0,
    outcome,
    outcomeAgeMs: outcomeAt ? Math.max(0, now - outcomeAt) : Number.POSITIVE_INFINITY,
    abandonCount,
  })

  return {
    status: timer.status,
    remainingMs,
    elapsedMs,
    durationMs: timer.durationMs,
    sessionStartedAt: timer.sessionStartedAt,
    tomatoState,
    start,
    pause,
    resume,
    reset,
    end,
    setDuration,
  }
}
