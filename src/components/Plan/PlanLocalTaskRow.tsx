import { PlanItemMenu } from './PlanItemMenu'
import { PlanRemoveButton } from './PlanRemoveButton'

interface PlanLocalTaskRowProps {
  index: number
  title: string
  detail?: string
  completed: boolean
  isUpNext: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onToggle: () => void
  onAddAbove: () => void
  onAddBelow: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onRemove: () => void
  onStartFocus?: () => void
}

export function PlanLocalTaskRow({
  index,
  title,
  detail,
  completed,
  isUpNext,
  canMoveUp,
  canMoveDown,
  onToggle,
  onAddAbove,
  onAddBelow,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
  onStartFocus,
}: PlanLocalTaskRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ${
        isUpNext ? 'ring-2 ring-tomato/40' : ''
      }`}
    >
      <span className="w-5 text-center text-xs text-text-muted">{index + 1}</span>
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        className="h-4 w-4 rounded accent-tomato"
        aria-label={`Mark "${title}" as complete`}
      />
      <div className="min-w-0 flex-1">
        {detail ? <p className="text-xs text-text-muted">{detail}</p> : null}
        <p
          className={`font-medium ${
            completed ? 'text-text-muted line-through' : 'text-text'
          }`}
        >
          {title}
        </p>
        {isUpNext ? (
          <p className="text-xs font-medium text-tomato">Up next</p>
        ) : null}
      </div>
      {onStartFocus && !completed ? (
        <button
          type="button"
          onClick={onStartFocus}
          className="rounded-lg px-2 py-1 text-xs font-medium text-tomato hover:text-tomato-dark"
        >
          Start Focus
        </button>
      ) : null}
      <PlanRemoveButton title={title} onRemove={onRemove} />
      <PlanItemMenu
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        editLabel="Edit"
        removeLabel="Remove from plan"
        onAddAbove={onAddAbove}
        onAddBelow={onAddBelow}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    </div>
  )
}
