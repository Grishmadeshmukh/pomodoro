import { useCallback, useEffect, useState } from 'react'
import {
  getDailyFlags,
  getGoldenTomatoDates,
  getHolidayDates,
  setHoliday,
} from '../repositories/dailyProgressRepository'
import { DATA_SYNCED_EVENT } from '../sync/syncEngine'
import { localDateKey } from '../utils/dateUtils'
import { GOLDEN_TOMATO_SETTLED_EVENT } from '../utils/goldenTomatoSettlement'

export function useDailyProgress(date = localDateKey(new Date())) {
  const [flags, setFlags] = useState(() => getDailyFlags(date))
  const [holidayDates, setHolidayDates] = useState(() => getHolidayDates())
  const [goldenDates, setGoldenDates] = useState(() => getGoldenTomatoDates())

  const toggleHoliday = useCallback(() => {
    const next = setHoliday(date, !getDailyFlags(date).holiday)
    setFlags(next)
    setHolidayDates(getHolidayDates())
    return next.holiday
  }, [date])

  const toggleHolidayForDate = useCallback(
    (targetDate: string) => {
      const next = setHoliday(targetDate, !getDailyFlags(targetDate).holiday)
      if (targetDate === date) setFlags(next)
      setHolidayDates(getHolidayDates())
      return next.holiday
    },
    [date],
  )

  useEffect(() => {
    const refreshGolden = () => {
      setFlags(getDailyFlags(date))
      setGoldenDates(getGoldenTomatoDates())
    }
    const refreshSynced = () => {
      refreshGolden()
      setHolidayDates(getHolidayDates())
    }
    window.addEventListener(GOLDEN_TOMATO_SETTLED_EVENT, refreshGolden)
    window.addEventListener(DATA_SYNCED_EVENT, refreshSynced)
    return () => {
      window.removeEventListener(GOLDEN_TOMATO_SETTLED_EVENT, refreshGolden)
      window.removeEventListener(DATA_SYNCED_EVENT, refreshSynced)
    }
  }, [date])

  return {
    date,
    holiday: flags.holiday,
    goldenTomato: flags.goldenTomato,
    holidayDates,
    goldenDates,
    toggleHoliday,
    toggleHolidayForDate,
  }
}
