import type { RoutineIcon } from '../../types'
import { PlanItemMenu } from './PlanItemMenu'
import { PlanRemoveButton } from './PlanRemoveButton'
import { RoutineIconImage } from './RoutineIconImage'

interface PlanRoutineRowProps {
  index: number
  title: string
  completed: boolean
  isUpNext: boolean
  icon?: RoutineIcon
  canMoveUp: boolean
  canMoveDown: boolean
  canRemove?: boolean
  onToggle: () => void
  onAddAbove: () => void
  onAddBelow: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onRemove: () => void
}

export function PlanRoutineRow({
  index,
  title,
  completed,
  isUpNext,
  icon,
  canMoveUp,
  canMoveDown,
  canRemove = true,
  onToggle,
  onAddAbove,
  onAddBelow,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
}: PlanRoutineRowProps) {
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
      {icon ? <RoutineIconImage icon={icon} size={36} /> : null}
      <div className="min-w-0 flex-1">
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
      <span className="shrink-0 rounded-full bg-cream-dark px-2 py-0.5 text-xs text-text-muted">
        Routine
      </span>
      {canRemove ? <PlanRemoveButton title={title} onRemove={onRemove} /> : null}
      <PlanItemMenu
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        canRemove={canRemove}
        editLabel="Edit"
        removeLabel="Delete"
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
