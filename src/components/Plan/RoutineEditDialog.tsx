import { useEffect, useRef, useState, type FormEvent } from 'react'

interface RoutineEditDialogProps {
  open: boolean
  title: string
  heading?: string
  onClose: () => void
  onSave: (title: string) => void
}

export function RoutineEditDialog({
  open,
  title,
  heading = 'Edit routine',
  onClose,
  onSave,
}: RoutineEditDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState(title)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setDraft(title)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open, title])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = draft.trim()
    if (!next) return
    onSave(next)
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="routine-edit-title"
      className="m-auto w-[min(calc(100%-2rem),24rem)] rounded-3xl border-0 bg-cream p-0 shadow-2xl backdrop:bg-text/40"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <form className="px-5 pt-5 pb-6" onSubmit={handleSubmit}>
        <h2 id="routine-edit-title" className="text-lg font-semibold text-text">
          {heading}
        </h2>
        <label className="mt-5 block text-sm font-medium text-text">
          Title
          <input
            required
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="mt-1 w-full rounded-xl border border-cream-dark bg-white px-3 py-2 text-sm text-text outline-none focus:border-tomato"
          />
        </label>
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-tomato py-3 text-sm font-semibold text-white shadow-sm hover:bg-tomato-dark"
        >
          Save
        </button>
      </form>
    </dialog>
  )
}
