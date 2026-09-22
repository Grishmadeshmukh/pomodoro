import { useCallback, useEffect, useState } from 'react'
import {
  getDailyFlags,
  getGoldenTomatoDates,
  getHolidayDates,
  setHoliday,
} from '../repositories/dailyProgressRepository'
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
    const refresh = () => {
      setFlags(getDailyFlags(date))
      setGoldenDates(getGoldenTomatoDates())
    }
    window.addEventListener(GOLDEN_TOMATO_SETTLED_EVENT, refresh)
    return () => window.removeEventListener(GOLDEN_TOMATO_SETTLED_EVENT, refresh)
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
