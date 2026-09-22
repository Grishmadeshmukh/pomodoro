import { MAX_VISIBLE_HOUR_TREES } from '../../utils/gardenVisual'

const PRESETS = [0, 1, 2, 3, 4, 5, 6, 7, 12, 18]

interface GardenHoursPreviewProps {
  hours: number
  actualHours: number
  onChange: (hours: number) => void
  onReset: () => void
  resetLabel?: string
  hint?: string
}

export function GardenHoursPreview({
  hours,
  actualHours,
  onChange,
  onReset,
  resetLabel,
  hint,
}: GardenHoursPreviewProps) {
  const previewing = hours !== actualHours

  return (
    <div className="mt-4 rounded-xl bg-cream-dark/40 px-3 py-3 text-left">
      <label className="flex items-center justify-between gap-3 text-sm font-medium text-text">
        Preview hours
        <input
          type="number"
          min={0}
          max={MAX_VISIBLE_HOUR_TREES}
          value={hours}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (!Number.isFinite(next)) return
            onChange(
              Math.min(MAX_VISIBLE_HOUR_TREES, Math.max(0, Math.floor(next))),
            )
          }}
          className="w-20 rounded-lg border border-cream-dark bg-white px-2 py-1 text-center text-base font-semibold text-text"
        />
      </label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              hours === preset
                ? 'bg-tomato text-white'
                : 'bg-white text-text-muted hover:text-text'
            }`}
          >
            {preset}h
          </button>
        ))}
      </div>
      {previewing ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 text-xs font-medium text-tomato hover:underline"
        >
          {resetLabel ??
            `Back to my ${actualHours} ${actualHours === 1 ? 'hour' : 'hours'}`}
        </button>
      ) : (
        <p className="mt-2 text-xs text-text-muted">
          {hint ??
            'Type hours or tap a preset. Hours 1–6 replace the same plant; hour 7 adds a new sapling.'}
        </p>
      )}
    </div>
  )
}
