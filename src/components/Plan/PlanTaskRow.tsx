import type { Task } from '../../types'
import { TaskItem } from '../Tasks/TaskItem'
import { PlanItemMenu } from './PlanItemMenu'
import { PlanRemoveButton } from './PlanRemoveButton'

interface PlanTaskRowProps {
  index: number
  task: Task
  isUpNext: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onToggle: () => void
  onToggleSubtask: (subtaskId: string) => void
  onEdit: () => void
  onAddAbove: () => void
  onAddBelow: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onStartFocus?: () => void
}

export function PlanTaskRow({
  index,
  task,
  isUpNext,
  canMoveUp,
  canMoveDown,
  onToggle,
  onToggleSubtask,
  onEdit,
  onAddAbove,
  onAddBelow,
  onMoveUp,
  onMoveDown,
  onRemove,
  onStartFocus,
}: PlanTaskRowProps) {
  return (
    <div
      className={`rounded-2xl ${isUpNext ? 'ring-2 ring-tomato/40' : ''}`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-4 w-5 shrink-0 text-center text-xs text-text-muted">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          {isUpNext ? (
            <p className="mb-1 pl-1 text-xs font-medium text-tomato">Up next</p>
          ) : null}
          <TaskItem
            task={task}
            inPlan={false}
            onToggle={onToggle}
            onToggleSubtask={onToggleSubtask}
            onEdit={onEdit}
            extraActions={
              <>
                {onStartFocus && !task.completed ? (
                  <button
                    type="button"
                    onClick={onStartFocus}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-tomato hover:text-tomato-dark"
                  >
                    Start Focus
                  </button>
                ) : null}
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
              </>
            }
          />
        </div>
        <PlanRemoveButton title={task.title} onRemove={onRemove} />
      </div>
    </div>
  )
}
