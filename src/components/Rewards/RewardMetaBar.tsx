import { HolidayToggle } from './HolidayToggle'

interface RewardMetaBarProps {
  weekend: boolean
  holiday: boolean
  onToggleHoliday: () => void
}

export function RewardMetaBar({
  weekend,
  holiday,
  onToggleHoliday,
}: RewardMetaBarProps) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      {weekend ? (
        <p className="rounded-full bg-tomato/15 px-3 py-1 text-xs font-semibold text-tomato">
          2× Weekend Bonus
        </p>
      ) : (
        <span />
      )}
      <HolidayToggle holiday={holiday} onToggle={onToggleHoliday} />
    </div>
  )
}
