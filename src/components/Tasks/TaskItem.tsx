import type { ReactNode } from 'react'
import type { Task, TaskPriority } from '../../types'
import { formatDeadlineLabel } from '../../utils/dateUtils'
import { hasOpenSubtasks } from '../../utils/taskCompletion'

interface TaskItemProps {
  task: Task
  inPlan?: boolean
  onToggle: () => void
  onToggleSubtask: (subtaskId: string) => void
  onEdit: () => void
  onDelete?: () => void
  onAddToPlan?: () => void
  plannedSubtaskIds?: Set<string>
  onAddSubtaskToPlan?: (subtaskId: string) => void
  extraActions?: ReactNode
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: 'bg-tomato/15 text-tomato',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-leaf/15 text-leaf-dark',
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export function TaskItem({
  task,
  inPlan = false,
  onToggle,
  onToggleSubtask,
  onEdit,
  onDelete,
  onAddToPlan,
  plannedSubtaskIds,
  onAddSubtaskToPlan,
  extraActions,
}: TaskItemProps) {
  const deadline = task.deadline ? formatDeadlineLabel(task.deadline) : null
  const subtaskDone = task.subtasks.filter((subtask) => subtask.completed).length
  const blocked = !task.completed && hasOpenSubtasks(task)
  const subtaskInPlan = (subtaskId: string) => plannedSubtaskIds?.has(subtaskId) ?? false
  const showWholeAdd = Boolean(onAddToPlan)
  const showSubtaskAdd = Boolean(onAddSubtaskToPlan)

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            disabled={blocked}
            onChange={onToggle}
            title={blocked ? 'Finish remaining subtasks first' : undefined}
            className={`mt-1 h-4 w-4 rounded accent-tomato ${
              blocked ? 'cursor-not-allowed opacity-40' : ''
            }`}
            aria-label={
              blocked
                ? `Finish remaining subtasks before marking "${task.title}" complete`
                : `Mark "${task.title}" as complete`
            }
          />
          <div className="min-w-0">
            <p
              className={`font-medium ${
                task.completed ? 'text-text-muted line-through' : 'text-text'
              }`}
            >
              {task.title}
            </p>
            {task.description ? (
              <p className="mt-0.5 text-sm text-text-muted">{task.description}</p>
            ) : null}
            {(deadline || inPlan) ? (
              <p className="mt-0.5 text-sm text-text-muted">
                {deadline ? (
                  <span className={deadline.overdue ? 'text-tomato' : undefined}>
                    {deadline.label}
                  </span>
                ) : null}
                {deadline && inPlan ? ' · ' : ''}
                {inPlan ? "In today's plan" : ''}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
          {task.subtasks.length > 0 ? (
            <span
              className="text-xs tabular-nums text-text-muted"
              aria-label={`${subtaskDone} of ${task.subtasks.length} subtasks complete`}
            >
              {subtaskDone}/{task.subtasks.length}
            </span>
          ) : null}
        </div>
      </div>

      {task.subtasks.length > 0 ? (
        <ul className="mt-3 ml-7 flex flex-col gap-1.5 border-l-2 border-cream-dark pl-4">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggleSubtask(subtask.id)}
                className="h-3.5 w-3.5 rounded accent-tomato"
                aria-label={`Mark subtask "${subtask.title}" as complete`}
              />
              <span
                className={`min-w-0 flex-1 text-sm ${
                  subtask.completed
                    ? 'text-text-muted line-through'
                    : 'text-text'
                }`}
              >
                {subtask.title}
              </span>
              {subtaskInPlan(subtask.id) ? (
                <span className="shrink-0 text-xs text-text-muted">In today&apos;s plan</span>
              ) : null}
              {showSubtaskAdd ? (
                <button
                  type="button"
                  onClick={() => onAddSubtaskToPlan?.(subtask.id)}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-tomato hover:text-tomato-dark"
                >
                  Add
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {showWholeAdd ? (
          <button
            type="button"
            onClick={onAddToPlan}
            className="rounded-lg px-2 py-1 text-xs font-medium text-tomato hover:text-tomato-dark"
          >
            {task.subtasks.length > 0 ? 'Add whole task' : "Add to today's plan"}
          </button>
        ) : null}
        {extraActions ?? (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg px-2 py-1 text-xs font-medium text-text-muted hover:text-text"
            >
              Edit
            </button>
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg px-2 py-1 text-xs font-medium text-text-muted hover:text-tomato"
              >
                Delete
              </button>
            ) : null}
          </>
        )}
      </div>
    </article>
  )
}
