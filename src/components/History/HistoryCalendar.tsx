import { Tomato } from '../Tomato/Tomato'
import { formatMinutes } from '../../utils/dateUtils'
import type { CalendarCell } from '../../utils/dateUtils'
import type { DayProgress } from '../../utils/sessionHistory'
import { isWeekend } from '../../utils/tomatoCalculations'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

interface HistoryCalendarProps {
  title: string
  cells: CalendarCell[]
  progressByDate: Map<string, DayProgress>
  holidayDates: ReadonlySet<string>
  goldenDates: ReadonlySet<string>
  todayKey: string
  selectedDateKey: string | null
  onSelectDate: (dateKey: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function HistoryCalendar({
  title,
  cells,
  progressByDate,
  holidayDates,
  goldenDates,
  todayKey,
  selectedDateKey,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: HistoryCalendarProps) {
  return (
    <section className="rounded-2xl bg-white px-3 py-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-lg px-2 py-1 text-lg leading-none text-text-muted hover:bg-cream-dark hover:text-text"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text">
          {title}
        </h3>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-lg px-2 py-1 text-lg leading-none text-text-muted hover:bg-cream-dark hover:text-text"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((label, index) => {
          const weekendColumn = index >= 5
          return (
            <div
              key={`${label}-${index}`}
              className={`rounded-md py-1 text-[11px] font-semibold ${
                weekendColumn
                  ? 'bg-leaf/10 text-leaf-dark'
                  : 'text-text-muted'
              }`}
            >
              {label}
            </div>
          )
        })}

        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="min-h-[4.5rem]" />
          }

          const progress = progressByDate.get(cell.dateKey)
          const isToday = cell.dateKey === todayKey
          const isSelected = cell.dateKey === selectedDateKey
          const isHoliday = holidayDates.has(cell.dateKey)
          const isGolden = goldenDates.has(cell.dateKey)
          const weekend = isWeekend(dateFromKey(cell.dateKey))
          const hasFocus =
            progress != null &&
            (progress.tomatoes > 0 || progress.focusMinutes > 0)

          const dayNotes = [
            isGolden ? 'golden tomato' : null,
            isHoliday ? 'holiday' : null,
            weekend ? 'weekend, streak exempt' : null,
          ]
            .filter(Boolean)
            .join(', ')

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => onSelectDate(cell.dateKey)}
              aria-pressed={isSelected}
              aria-label={
                dayNotes ? `${cell.day}, ${dayNotes}` : String(cell.day)
              }
              className={`flex min-h-[4.5rem] flex-col items-center rounded-xl px-0.5 py-1 transition ${
                isSelected
                  ? 'bg-cream-dark ring-2 ring-tomato/50'
                  : isToday
                    ? weekend
                      ? 'bg-leaf/15 ring-1 ring-tomato/40'
                      : 'bg-bg ring-1 ring-tomato/40'
                    : weekend
                      ? 'bg-leaf/10 hover:bg-leaf/15'
                      : 'hover:bg-cream-dark/60'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday ? 'text-tomato' : 'text-text'
                }`}
              >
                {cell.day}
              </span>
              {isGolden ? (
                <Tomato variant="golden" size={14} className="mt-0.5" alt="" />
              ) : null}
              {isHoliday ? (
                <span className="mt-0.5 text-[9px] font-semibold leading-none text-leaf-dark">
                  Holiday
                </span>
              ) : null}
              {hasFocus && progress ? (
                <>
                  <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold leading-none text-tomato">
                    +{progress.tomatoes}
                    <Tomato size={10} alt="" />
                  </span>
                  <span className="mt-0.5 text-[10px] leading-none text-text-muted">
                    {formatMinutes(progress.focusMinutes)}
                  </span>
                </>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
