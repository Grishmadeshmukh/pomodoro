import { useEffect, useRef, useState } from 'react'

interface PlanItemMenuProps {
  canMoveUp: boolean
  canMoveDown: boolean
  canRemove?: boolean
  editLabel: string
  removeLabel: string
  onAddAbove: () => void
  onAddBelow: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onRemove: () => void
}

const itemClass =
  'w-full px-3 py-2 text-left text-sm text-text hover:bg-cream disabled:text-text-muted'

export function PlanItemMenu({
  canMoveUp,
  canMoveDown,
  canRemove = true,
  editLabel,
  removeLabel,
  onAddAbove,
  onAddBelow,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
}: PlanItemMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [open])

  function run(action: () => void) {
    setOpen(false)
    action()
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="rounded-lg px-2 py-1 text-sm font-medium text-text-muted hover:text-text"
        aria-label="Item actions"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        ⋯
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl bg-white py-1 shadow-lg">
          <button type="button" className={itemClass} onClick={() => run(onAddAbove)}>
            Add above
          </button>
          <button type="button" className={itemClass} onClick={() => run(onAddBelow)}>
            Add below
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={() => run(onMoveUp)}
            disabled={!canMoveUp}
          >
            Move up
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={() => run(onMoveDown)}
            disabled={!canMoveDown}
          >
            Move down
          </button>
          <button type="button" className={itemClass} onClick={() => run(onEdit)}>
            {editLabel}
          </button>
          {canRemove ? (
            <button
              type="button"
              className={`${itemClass} hover:text-tomato`}
              onClick={() => run(onRemove)}
            >
              {removeLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
