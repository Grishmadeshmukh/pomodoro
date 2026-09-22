interface HolidayToggleProps {
  holiday: boolean
  onToggle: () => void
}

export function HolidayToggle({ holiday, onToggle }: HolidayToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={holiday}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        holiday
          ? 'bg-leaf/20 text-leaf-dark'
          : 'bg-white text-text-muted shadow-sm'
      }`}
    >
      {holiday ? 'Holiday' : 'Mark holiday'}
    </button>
  )
}
