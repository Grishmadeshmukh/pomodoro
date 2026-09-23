import { useEffect, useRef } from 'react'

interface CompletedTaskDialogProps {
  open: boolean
  title: string
  onClose: () => void
  onDelete: () => void
  onAddSubtasks: () => void
}

export function CompletedTaskDialog({
  open,
  title,
  onClose,
  onDelete,
  onAddSubtasks,
}: CompletedTaskDialogProps) {
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
      aria-labelledby="completed-task-title"
      className="m-auto w-[min(calc(100%-2rem),24rem)] rounded-3xl border-0 bg-cream p-0 shadow-2xl backdrop:bg-text/40"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="px-5 pt-5 pb-6">
        <h2 id="completed-task-title" className="text-lg font-semibold text-text">
          Delete “{title}”?
        </h2>
        <p className="mt-3 text-sm text-text-muted">
          This task is done. Delete it now, or keep it if you want to add more
          subtasks. It will be deleted in 24 hours either way.
        </p>
        <button
          type="button"
          onClick={onAddSubtasks}
          className="mt-6 w-full rounded-full border border-cream-dark bg-white py-3 text-sm font-semibold text-text hover:bg-cream-dark/40"
        >
          Add more subtasks
        </button>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-cream-dark bg-white py-3 text-sm font-semibold text-text hover:bg-cream-dark/40"
          >
            Keep for now
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 rounded-full bg-tomato py-3 text-sm font-semibold text-white shadow-sm hover:bg-tomato-dark"
          >
            Delete
          </button>
        </div>
      </div>
    </dialog>
  )
}
