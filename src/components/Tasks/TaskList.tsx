import { useRef, useState, type ReactNode } from 'react'
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
  onReorder?: (orderedIds: string[]) => void
}

const GAP = 12

interface DragState {
  id: string
  from: number
  to: number
  dy: number
  height: number
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
  onReorder,
}: TaskListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet."
        description="Create a task, then add it to today's plan."
        action={emptyAction}
      />
    )
  }

  function shift(index: number): number {
    if (!drag || index === drag.from) return drag?.from === index ? drag.dy : 0
    if (drag.to > drag.from && index > drag.from && index <= drag.to) {
      return -(drag.height + GAP)
    }
    if (drag.to < drag.from && index >= drag.to && index < drag.from) {
      return drag.height + GAP
    }
    return 0
  }

  function beginDrag(index: number, clientY: number) {
    if (!onReorder) return
    const card = listRef.current?.querySelectorAll<HTMLElement>('[data-task-id]')[index]
    const height = card?.getBoundingClientRect().height ?? 0
    const mids = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-task-id]') ?? [],
    ).map((el) => {
      const rect = el.getBoundingClientRect()
      return rect.top + rect.height / 2
    })
    const completed = tasks[index].completed
    const start: DragState = {
      id: tasks[index].id,
      from: index,
      to: index,
      dy: 0,
      height,
    }
    dragRef.current = start
    setDrag(start)

    function onMove(event: PointerEvent) {
      const dy = event.clientY - clientY
      const center = mids[index] + dy
      let to = index
      if (dy > 0) {
        for (let i = index + 1; i < tasks.length; i++) {
          if (tasks[i].completed !== completed) break
          if (center > mids[i]) to = i
          else break
        }
      } else {
        for (let i = index - 1; i >= 0; i--) {
          if (tasks[i].completed !== completed) break
          if (center < mids[i]) to = i
          else break
        }
      }
      const next = { id: tasks[index].id, from: index, to, dy, height }
      dragRef.current = next
      setDrag(next)
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      const current = dragRef.current
      dragRef.current = null
      setDrag(null)
      if (!current || current.to === current.from) return
      const next = [...tasks]
      const [moved] = next.splice(current.from, 1)
      next.splice(current.to, 0, moved)
      onReorder?.(next.filter((task) => task.completed === completed).map((task) => task.id))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      ref={listRef}
      className={`flex flex-col gap-3 ${drag ? 'select-none' : ''}`}
    >
      {tasks.map((task, index) => {
        const offset = shift(index)
        const dragging = drag?.from === index
        return (
          <div
            key={task.id}
            data-task-id={task.id}
            className={dragging ? 'relative z-10' : 'relative'}
            style={{
              transform: offset ? `translateY(${offset}px)` : undefined,
              transition: dragging ? undefined : 'transform 150ms ease',
            }}
          >
            <TaskItem
              task={task}
              inPlan={planTaskIds?.has(task.id)}
              plannedSubtaskIds={planSubtaskIds}
              dragging={dragging}
              onDragHandlePointerDown={
                onReorder
                  ? (event) => {
                      if (event.button !== 0) return
                      event.preventDefault()
                      beginDrag(index, event.clientY)
                    }
                  : undefined
              }
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
          </div>
        )
      })}
    </div>
  )
}
