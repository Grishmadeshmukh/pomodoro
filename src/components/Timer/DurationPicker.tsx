import { DurationWheel } from './DurationWheel'

const HOUR_VALUES = [0, 1, 2, 3, 4, 5, 6]
const PRESETS = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
]

function minuteValuesForHours(hours: number): number[] {
  if (hours === 6) return [0]
  if (hours === 0) return [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
  return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
}

function splitDuration(durationMs: number): { hours: number; minutes: number } {
  const totalMinutes = Math.round(durationMs / 60000)
  const hours = Math.min(6, Math.floor(totalMinutes / 60))
  const rawMinutes = hours === 6 ? 0 : totalMinutes - hours * 60
  const options = minuteValuesForHours(hours)
  const minutes = options.includes(rawMinutes)
    ? rawMinutes
    : (options.find((option) => option >= rawMinutes) ?? options[options.length - 1])
  return { hours, minutes }
}

interface DurationPickerProps {
  durationMs: number
  onChange: (durationMs: number) => void
}

export function DurationPicker({ durationMs, onChange }: DurationPickerProps) {
  const { hours, minutes } = splitDuration(durationMs)
  const minuteValues = minuteValuesForHours(hours)
  const selectedMinutes = hours * 60 + minutes

  function commit(nextHours: number, nextMinutes: number) {
    const options = minuteValuesForHours(nextHours)
    const safeMinutes = options.includes(nextMinutes)
      ? nextMinutes
      : (options.find((option) => option >= nextMinutes) ?? options[0])
    onChange((nextHours * 60 + safeMinutes) * 60 * 1000)
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRESETS.map((preset) => {
          const selected = selectedMinutes === preset.minutes
          return (
            <button
              key={preset.minutes}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(preset.minutes * 60 * 1000)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                selected
                  ? 'bg-tomato text-white'
                  : 'bg-white text-text-muted shadow-sm hover:text-text'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <DurationWheel
            ariaLabel="Hours"
            values={HOUR_VALUES}
            value={hours}
            formatValue={(value) => String(value)}
            onChange={(nextHours) => commit(nextHours, minutes)}
            autoFocus
          />
          <p className="mt-1 text-xs font-medium text-text-muted">hours</p>
        </div>
        <span className="pb-5 text-3xl font-light text-text-muted">:</span>
        <div className="flex flex-col items-center">
          <DurationWheel
            ariaLabel="Minutes"
            values={minuteValues}
            value={minutes}
            formatValue={(value) => String(value).padStart(2, '0')}
            onChange={(nextMinutes) => commit(hours, nextMinutes)}
          />
          <p className="mt-1 text-xs font-medium text-text-muted">min</p>
        </div>
      </div>
    </div>
  )
}
