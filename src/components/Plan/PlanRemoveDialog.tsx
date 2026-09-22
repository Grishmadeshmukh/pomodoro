import { useEffect, useRef } from 'react'

interface PlanRemoveDialogProps {
  open: boolean
  title: string
  onClose: () => void
  onConfirm: () => void
}

export function PlanRemoveDialog({
  open,
  title,
  onClose,
  onConfirm,
}: PlanRemoveDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="plan-remove-title"
      className="m-auto w-[min(calc(100%-2rem),24rem)] rounded-3xl border-0 bg-cream p-0 shadow-2xl backdrop:bg-text/40"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="px-5 pt-5 pb-6">
        <h2 id="plan-remove-title" className="text-lg font-semibold text-text">
          Remove from today&apos;s plan?
        </h2>
        <p className="mt-3 text-sm text-text-muted">
          “{title}” will be taken off today&apos;s plan. This does not delete it
          from Tasks.
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-cream-dark bg-white py-3 text-sm font-semibold text-text hover:bg-cream-dark/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-tomato py-3 text-sm font-semibold text-white shadow-sm hover:bg-tomato-dark"
          >
            Remove
          </button>
        </div>
      </div>
    </dialog>
  )
}
