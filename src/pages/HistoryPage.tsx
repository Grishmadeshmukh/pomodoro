import { useMemo, useState } from 'react'
import { HistoryCalendar } from '../components/History/HistoryCalendar'
import { HolidayToggle } from '../components/Rewards/HolidayToggle'
import { Tomato } from '../components/Tomato/Tomato'
import { useDailyProgress } from '../hooks/useDailyProgress'
import { useFocusSessions } from '../hooks/useFocusSessions'
import {
  formatMonthTitle,
  localDateKey,
  monthGrid,
  shiftMonth,
} from '../utils/dateUtils'
import { progressByDate } from '../utils/sessionHistory'

function formatSelectedDayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function HistoryPage() {
  const { sessions } = useFocusSessions()
  const { holidayDates, goldenDates, toggleHolidayForDate } = useDailyProgress()
  const now = new Date()
  const todayKey = localDateKey(now)
  const [{ year, month }, setCursor] = useState(() => ({
    year: now.getFullYear(),
    month: now.getMonth(),
  }))
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(todayKey)

  const dailyProgress = useMemo(() => progressByDate(sessions), [sessions])
  const cells = useMemo(() => monthGrid(year, month), [year, month])
  const holidaySet = useMemo(() => new Set(holidayDates), [holidayDates])
  const goldenSet = useMemo(() => new Set(goldenDates), [goldenDates])
  const selectedHoliday =
    selectedDateKey != null && holidaySet.has(selectedDateKey)
  const selectedGolden =
    selectedDateKey != null && goldenSet.has(selectedDateKey)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-text">History</h2>
        <p className="mt-1 text-sm text-text-muted">
          Tomatoes and focus time by day. A golden tomato shows up once the day
          ends with every plan item still complete. Saturdays and Sundays are
          highlighted; they won&apos;t break your streak. Select any day to mark
          it as a holiday.
        </p>
      </div>

      <HistoryCalendar
        title={formatMonthTitle(year, month)}
        cells={cells}
        progressByDate={dailyProgress}
        holidayDates={holidaySet}
        goldenDates={goldenSet}
        todayKey={todayKey}
        selectedDateKey={selectedDateKey}
        onSelectDate={setSelectedDateKey}
        onPrevMonth={() => setCursor((current) => shiftMonth(current.year, current.month, -1))}
        onNextMonth={() => setCursor((current) => shiftMonth(current.year, current.month, 1))}
      />

      {selectedDateKey ? (
        <section className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text">
              {formatSelectedDayLabel(selectedDateKey)}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              Holidays do not break your streak and do not count toward it.
            </p>
            {selectedGolden ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                <Tomato variant="golden" size={18} alt="" />
                Golden tomato
              </p>
            ) : selectedDateKey === todayKey ? (
              <p className="mt-2 text-xs text-text-muted">
                If every plan item is still done when today ends, a golden tomato
                will show here.
              </p>
            ) : null}
          </div>
          <HolidayToggle
            holiday={selectedHoliday}
            onToggle={() => toggleHolidayForDate(selectedDateKey)}
          />
        </section>
      ) : null}
    </div>
  )
}
