import { useCallback, useState } from 'react'
import {
  getDailyFlags,
  getGoldenTomatoDates,
  getHolidayDates,
  markGoldenTomato,
  setHoliday,
} from '../repositories/dailyProgressRepository'
import { localDateKey } from '../utils/dateUtils'

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

  const awardGoldenTomato = useCallback(() => {
    if (getDailyFlags(date).goldenTomato) return false
    const next = markGoldenTomato(date)
    setFlags(next)
    setGoldenDates(getGoldenTomatoDates())
    return true
  }, [date])

  return {
    date,
    holiday: flags.holiday,
    goldenTomato: flags.goldenTomato,
    holidayDates,
    goldenDates,
    toggleHoliday,
    awardGoldenTomato,
  }
}
