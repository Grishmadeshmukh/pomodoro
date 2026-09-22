import type { TomatoState } from '../types'

export const LONG_FOCUS_MS = 25 * 60 * 1000
export const SLEEPY_AFTER_MS = 20 * 1000
export const JOYOUS_HOLD_MS = 3500
export const ANGRY_AFTER_ABANDONS = 3

export type SessionOutcome = 'none' | 'completed' | 'abandoned'

export function getTomatoState(input: {
  status: 'idle' | 'running' | 'paused'
  elapsedMs: number
  idleMs: number
  outcome: SessionOutcome
  outcomeAgeMs: number
  abandonCount: number
}): TomatoState {
  const {
    status,
    elapsedMs,
    idleMs,
    outcome,
    outcomeAgeMs,
    abandonCount,
  } = input

  if (status === 'running') {
    return elapsedMs >= LONG_FOCUS_MS ? 'energised' : 'focusing'
  }

  if (status === 'paused') return 'focusing'

  if (outcome === 'completed' && outcomeAgeMs < JOYOUS_HOLD_MS) {
    return 'completed'
  }

  if (outcome === 'abandoned' && outcomeAgeMs < JOYOUS_HOLD_MS) {
    return abandonCount >= ANGRY_AFTER_ABANDONS ? 'angry' : 'abandoned'
  }

  if (idleMs >= SLEEPY_AFTER_MS) return 'sleepy'
  return 'idle'
}
