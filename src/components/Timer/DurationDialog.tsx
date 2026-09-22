import { useEffect, useRef, useState } from 'react'
import { formatTimer } from '../../utils/dateUtils'
import { DurationPicker } from './DurationPicker'

interface DurationDialogProps {
  open: boolean
  durationMs: number
  onClose: () => void
  onSave: (durationMs: number) => void
}

export function DurationDialog({
  open,
  durationMs,
  onClose,
  onSave,
}: DurationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draftMs, setDraftMs] = useState(durationMs)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setDraftMs(durationMs)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [durationMs, open])

  function saveAndClose() {
    onSave(draftMs)
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="duration-dialog-title"
      className="m-auto w-[min(calc(100%-2rem),24rem)] max-h-[90vh] overflow-y-auto rounded-3xl border-0 bg-cream p-0 shadow-2xl backdrop:bg-text/40"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="duration-dialog-title"
              className="text-lg font-semibold text-text"
            >
              Focus duration
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Scroll or pick a preset, 5 min to 6 hours
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>

        <p className="mt-5 text-center font-mono text-5xl font-light text-text">
          {formatTimer(draftMs)}
        </p>

        {open ? (
          <div className="mt-5">
            <DurationPicker durationMs={draftMs} onChange={setDraftMs} />
          </div>
        ) : null}

        <button
          type="button"
          onClick={saveAndClose}
          className="mt-6 w-full rounded-full bg-tomato py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-tomato-dark"
        >
          Done
        </button>
      </div>
    </dialog>
  )
}
