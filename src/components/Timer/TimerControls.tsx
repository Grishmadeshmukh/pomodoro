import type { TimerStatus } from '../../hooks/useTimer'

interface TimerControlsProps {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onEnd: () => void
}

const primaryButtonClass =
  'rounded-full bg-tomato px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-tomato-dark active:scale-95'
const secondaryButtonClass =
  'rounded-full border border-cream-dark bg-white px-6 py-3 text-sm font-medium text-text-muted transition hover:border-tomato-light hover:text-text active:scale-95'

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onEnd,
}: TimerControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {status === 'idle' ? (
        <button type="button" className={primaryButtonClass} onClick={onStart}>
          Start
        </button>
      ) : status === 'running' ? (
        <button type="button" className={primaryButtonClass} onClick={onPause}>
          Pause
        </button>
      ) : (
        <button type="button" className={primaryButtonClass} onClick={onResume}>
          Resume
        </button>
      )}
      {status !== 'idle' ? (
        <>
          <button type="button" className={secondaryButtonClass} onClick={onEnd}>
            End
          </button>
          <button type="button" className={secondaryButtonClass} onClick={onReset}>
            Reset
          </button>
        </>
      ) : null}
    </div>
  )
}
