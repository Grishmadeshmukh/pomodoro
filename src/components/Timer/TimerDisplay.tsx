import { useState } from 'react'
import type { SessionType } from '../../types'
import { DurationDialog } from './DurationDialog'

interface TimerDisplayProps {
  timeDisplay: string
  sessionType: SessionType
  editable?: boolean
  durationMs?: number
  onDurationChange?: (durationMs: number) => void
}

const SESSION_LABELS: Record<SessionType, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

const SESSION_COLORS: Record<SessionType, string> = {
  focus: 'text-tomato',
  shortBreak: 'text-leaf',
  longBreak: 'text-leaf-dark',
}

export function TimerDisplay({
  timeDisplay,
  sessionType,
  editable = false,
  durationMs = 0,
  onDurationChange,
}: TimerDisplayProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {editable && onDurationChange ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-label={`Focus duration ${timeDisplay}. Tap to change.`}
          className="font-mono text-6xl font-light tracking-tight text-text sm:text-7xl"
        >
          {timeDisplay}
        </button>
      ) : (
        <div
          className="font-mono text-6xl font-light tracking-tight text-text sm:text-7xl"
          aria-live="polite"
        >
          {timeDisplay}
        </div>
      )}
      <span
        className={`text-lg font-medium tracking-wide uppercase ${SESSION_COLORS[sessionType]}`}
      >
        {SESSION_LABELS[sessionType]}
      </span>
      {editable ? (
        <p className="text-xs text-text-muted">Tap the time to change duration</p>
      ) : null}
      {onDurationChange ? (
        <DurationDialog
          open={pickerOpen}
          durationMs={durationMs}
          onClose={() => setPickerOpen(false)}
          onSave={onDurationChange}
        />
      ) : null}
    </div>
  )
}
