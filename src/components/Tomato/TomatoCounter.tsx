import { Tomato } from './Tomato'

interface TomatoCounterProps {
  tomatoes: number
  goal?: number
  label?: string
  multiplier?: 1 | 2
}

export function TomatoCounter({
  tomatoes,
  goal = 10,
  label = 'Tomato progress',
  multiplier = 1,
}: TomatoCounterProps) {
  const shown = Math.min(Math.max(0, tomatoes), 12)

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-tomato/10 to-tomato-light/10 px-5 py-4 shadow-sm">
      <Tomato size={40} alt="" />
      <div className="min-w-0 flex-1">
        <span className="text-sm text-text-muted">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-tomato">
            {tomatoes} / {goal}
          </span>
          {multiplier === 2 ? (
            <span className="text-xs font-semibold text-tomato">2×</span>
          ) : null}
        </div>
        {shown > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from({ length: shown }, (_, index) => (
              <Tomato key={index} size={16} alt="" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
