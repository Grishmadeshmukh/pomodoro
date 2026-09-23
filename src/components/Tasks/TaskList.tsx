import type { ReactNode } from 'react'
import type { Task } from '../../types'
import { EmptyState } from '../Common/EmptyState'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  planTaskIds?: Set<string>
  planSubtaskIds?: Set<string>
  emptyAction?: ReactNode
  onToggle: (id: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onAddToPlan?: (task: Task) => void
  onAddSubtaskToPlan?: (task: Task, subtaskId: string) => void
}

export function TaskList({
  tasks,
  planTaskIds,
  planSubtaskIds,
  emptyAction,
  onToggle,
  onToggleSubtask,
  onEdit,
  onDelete,
  onAddToPlan,
  onAddSubtaskToPlan,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet."
        description="Create a task, then add it to today's plan."
        action={emptyAction}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          inPlan={planTaskIds?.has(task.id)}
          plannedSubtaskIds={planSubtaskIds}
          onToggle={() => onToggle(task.id)}
          onToggleSubtask={(subtaskId) => onToggleSubtask(task.id, subtaskId)}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task)}
          onAddToPlan={onAddToPlan ? () => onAddToPlan(task) : undefined}
          onAddSubtaskToPlan={
            onAddSubtaskToPlan
              ? (subtaskId) => onAddSubtaskToPlan(task, subtaskId)
              : undefined
          }
        />
      ))}
    </div>
  )
}
