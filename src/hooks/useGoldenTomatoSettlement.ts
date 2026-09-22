import { useEffect, useState } from 'react'
import { localDateKey } from '../utils/dateUtils'
import { settleElapsedGoldenTomatoes } from '../utils/goldenTomatoSettlement'

function msUntilNextLocalMidnight(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return Math.max(0, next.getTime() - now.getTime()) + 50
}

/** Confirm yesterday's golden tomato once the calendar day rolls over. */
export function useGoldenTomatoSettlement() {
  useState(() => {
    settleElapsedGoldenTomatoes()
    return true
  })

  useEffect(() => {
    let timer = 0
    let lastKey = localDateKey(new Date())

    const lockIfDayChanged = () => {
      const nextKey = localDateKey(new Date())
      if (nextKey === lastKey) return
      lastKey = nextKey
      settleElapsedGoldenTomatoes(nextKey)
    }

    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        lockIfDayChanged()
        schedule()
      }, msUntilNextLocalMidnight())
    }

    schedule()
    document.addEventListener('visibilitychange', lockIfDayChanged)
    window.addEventListener('focus', lockIfDayChanged)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', lockIfDayChanged)
      window.removeEventListener('focus', lockIfDayChanged)
    }
  }, [])
}
