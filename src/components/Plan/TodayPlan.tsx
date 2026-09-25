import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { PlanItem, ResolvedPlanItem, Task } from '../../types'
import {
  isPermanentPlanItem,
  type RoutinePreset,
} from '../../utils/defaultRoutine'
import { EmptyState } from '../Common/EmptyState'
import { TaskFormDialog } from '../Tasks/TaskFormDialog'
import { PlanAddDialog } from './PlanAddDialog'
import { PlanInsertPoint } from './PlanInsertPoint'
import { PlanLocalTaskRow } from './PlanLocalTaskRow'
import { PlanRemoveDialog } from './PlanRemoveDialog'
import { PlanRoutineRow } from './PlanRoutineRow'
import { PlanTaskRow } from './PlanTaskRow'
import { RoutineEditDialog } from './RoutineEditDialog'

interface DragState {
  from: number
  to: number
  dy: number
  height: number
}

interface TodayPlanProps {
  items: PlanItem[]
  resolved: ResolvedPlanItem[]
  tasks: Task[]
  upNextId?: string
  onAddRoutine: (preset: RoutinePreset, atIndex: number) => void
  onAddCustomRoutine: (title: string, atIndex: number) => void
  onAddTask: (task: Task, atIndex: number) => void
  onAddSubtask: (task: Task, subtaskId: string, atIndex: number) => void
  onCreateListedTask: (task: Task, atIndex: number) => void
  onCreatePlanOnlyTask: (title: string, atIndex: number) => void
  onMoveItem: (fromIndex: number, toIndex: number) => void
  onRemoveItem: (id: string) => void
  onToggleLocal: (id: string) => boolean
  onRenameItem: (id: string, title: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onSaveTask: (task: Task) => void
  onStartFocus?: () => void
}

export function TodayPlan({
  items,
  resolved,
  tasks,
  upNextId,
  onAddRoutine,
  onAddCustomRoutine,
  onAddTask,
  onAddSubtask,
  onCreateListedTask,
  onCreatePlanOnlyTask,
  onMoveItem,
  onRemoveItem,
  onToggleLocal,
  onRenameItem,
  onToggleSubtask,
  onSaveTask,
  onStartFocus,
}: TodayPlanProps) {
  const completedCount = resolved.filter((item) => item.completed).length
  const listRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingLocal, setEditingLocal] = useState<PlanItem | null>(null)
  const [pendingRemove, setPendingRemove] = useState<{
    id: string
    title: string
  } | null>(null)

  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  const planTaskIds = new Set(
    items.filter((item) => item.taskId && !item.subtaskId).map((item) => item.taskId as string),
  )
  const planSubtaskIds = new Set(
    items.filter((item) => item.subtaskId).map((item) => item.subtaskId as string),
  )

  function openAdd(index: number) {
    setInsertIndex(index)
  }

  function shift(index: number): number {
    if (!drag || index === drag.from) return drag?.from === index ? drag.dy : 0
    if (drag.to > drag.from && index > drag.from && index <= drag.to) return -drag.height
    if (drag.to < drag.from && index >= drag.to && index < drag.from) return drag.height
    return 0
  }

  function beginDrag(index: number, clientY: number) {
    const card = listRef.current?.querySelectorAll<HTMLElement>('[data-plan-id]')[index]
    const height = card?.getBoundingClientRect().height ?? 0
    const mids = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-plan-id]') ?? [],
    ).map((el) => {
      const rect = el.getBoundingClientRect()
      return rect.top + rect.height / 2
    })
    const start: DragState = { from: index, to: index, dy: 0, height }
    dragRef.current = start
    setDrag(start)

    function onMove(event: PointerEvent) {
      const dy = event.clientY - clientY
      const center = mids[index] + dy
      let to = index
      if (dy > 0) {
        for (let i = index + 1; i < resolved.length; i++) {
          if (center > mids[i]) to = i
          else break
        }
      } else {
        for (let i = index - 1; i >= 0; i--) {
          if (center < mids[i]) to = i
          else break
        }
      }
      const next = { from: index, to, dy, height }
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
      onMoveItem(current.from, current.to)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const addOpen = insertIndex !== null
  const atIndex = insertIndex ?? items.length

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-text">Today&apos;s Plan</h2>
        <p className="text-sm text-text-muted">
          {completedCount} / {resolved.length}
        </p>
      </div>

      {resolved.length === 0 ? (
        <EmptyState
          title="Nothing planned yet."
          description="Add a routine or a task to build today's plan."
          action={
            <button
              type="button"
              onClick={() => openAdd(0)}
              className="rounded-xl bg-tomato px-3 py-2 text-sm font-medium text-white hover:bg-tomato-dark"
            >
              + Add item
            </button>
          }
        />
      ) : (
        <div ref={listRef} className={drag ? 'select-none' : undefined}>
          <PlanInsertPoint onClick={() => openAdd(0)} />
          {resolved.map((item, index) => {
            const source = items[index]
            const isUpNext = item.id === upNextId
            const shared = {
              index,
              isUpNext,
              canMoveUp: index > 0,
              canMoveDown: index < resolved.length - 1,
              onAddAbove: () => openAdd(index),
              onAddBelow: () => openAdd(index + 1),
              onMoveUp: () => onMoveItem(index, index - 1),
              onMoveDown: () => onMoveItem(index, index + 1),
              onRemove: () =>
                setPendingRemove({ id: item.id, title: item.title }),
            }

            const offset = shift(index)
            const dragging = drag?.from === index

            return (
              <div
                key={item.id}
                data-plan-id={item.id}
                className={dragging ? 'relative z-10' : 'relative'}
                style={{
                  transform: offset ? `translateY(${offset}px)` : undefined,
                  transition: dragging ? undefined : 'transform 150ms ease',
                }}
              >
                <div className="flex items-start gap-1">
                  <button
                    type="button"
                    aria-label={`Reorder "${item.title}"`}
                    onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
                      if (event.button !== 0) return
                      event.preventDefault()
                      beginDrag(index, event.clientY)
                    }}
                    className={`mt-3 touch-none rounded p-1 text-text-muted hover:bg-cream-dark ${
                      dragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  >
                    <Grip />
                  </button>
                  <div className="min-w-0 flex-1">
                {item.kind === 'task' && item.taskId && item.subtaskId ? (
                  <PlanLocalTaskRow
                    {...shared}
                    title={item.title}
                    detail={item.detail}
                    completed={item.completed}
                    onToggle={() => onToggleLocal(item.id)}
                    onEdit={() => {
                      const task = tasksById.get(item.taskId!)
                      if (task) setEditingTask(task)
                    }}
                    onStartFocus={onStartFocus}
                  />
                ) : item.kind === 'task' && item.taskId ? (
                  <PlanTaskRow
                    {...shared}
                    task={{
                      ...(tasksById.get(item.taskId) ?? {
                        id: item.taskId,
                        title: item.title,
                        priority: 'medium' as const,
                        createdAt: '',
                        subtasks: [],
                      }),
                      completed: item.completed,
                    }}
                    onToggle={() => onToggleLocal(item.id)}
                    onToggleSubtask={(subtaskId) =>
                      onToggleSubtask(item.taskId!, subtaskId)
                    }
                    onEdit={() => {
                      const task = tasksById.get(item.taskId!)
                      if (task) setEditingTask(task)
                    }}
                    onStartFocus={onStartFocus}
                  />
                ) : item.kind === 'task' ? (
                  <PlanLocalTaskRow
                    {...shared}
                    title={item.title}
                    completed={item.completed}
                    onToggle={() => onToggleLocal(item.id)}
                    onEdit={() => setEditingLocal(source)}
                    onStartFocus={onStartFocus}
                  />
                ) : (
                  <PlanRoutineRow
                    {...shared}
                    title={item.title}
                    completed={item.completed}
                    icon={item.icon}
                    canRemove={!isPermanentPlanItem(source)}
                    onToggle={() => onToggleLocal(item.id)}
                    onEdit={() => setEditingLocal(source)}
                  />
                )}
                  </div>
                </div>
                <PlanInsertPoint onClick={() => openAdd(index + 1)} />
              </div>
            )
          })}
        </div>
      )}

      {resolved.length > 0 ? (
        <button
          type="button"
          onClick={() => openAdd(items.length)}
          className="mt-2 w-full rounded-2xl border border-dashed border-cream-dark bg-white px-4 py-3 text-sm font-medium text-text-muted hover:border-tomato/40 hover:text-text"
        >
          + Add item
        </button>
      ) : null}

      <PlanAddDialog
        open={addOpen}
        tasks={tasks}
        planTaskIds={planTaskIds}
        planSubtaskIds={planSubtaskIds}
        routineKeys={
          new Set(
            items
              .filter((item) => item.routineKey)
              .map((item) => item.routineKey as string),
          )
        }
        onClose={() => setInsertIndex(null)}
        onAddRoutine={(preset) => onAddRoutine(preset, atIndex)}
        onAddCustomRoutine={(title) => onAddCustomRoutine(title, atIndex)}
        onAddExistingTask={(task, subtaskId) => {
          if (subtaskId) onAddSubtask(task, subtaskId, atIndex)
          else onAddTask(task, atIndex)
        }}
        onCreateTask={(title, addToTasks) => {
          if (addToTasks) {
            const taskId = crypto.randomUUID()
            onCreateListedTask(
              {
                id: taskId,
                title,
                priority: 'medium',
                completed: false,
                createdAt: new Date().toISOString(),
                subtasks: [],
              },
              atIndex,
            )
            return
          }
          onCreatePlanOnlyTask(title, atIndex)
        }}
      />

      <TaskFormDialog
        open={editingTask !== null}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={onSaveTask}
      />

      <RoutineEditDialog
        open={editingLocal !== null}
        title={editingLocal?.title ?? ''}
        heading={editingLocal?.kind === 'task' ? 'Edit task' : 'Edit routine'}
        onClose={() => setEditingLocal(null)}
        onSave={(title) => {
          if (editingLocal) onRenameItem(editingLocal.id, title)
        }}
      />

      <PlanRemoveDialog
        open={pendingRemove !== null}
        title={pendingRemove?.title ?? ''}
        onClose={() => setPendingRemove(null)}
        onConfirm={() => {
          if (!pendingRemove) return
          onRemoveItem(pendingRemove.id)
          setPendingRemove(null)
        }}
      />
    </section>
  )
}

function Grip() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <circle cx="7" cy="5" r="1.3" />
      <circle cx="13" cy="5" r="1.3" />
      <circle cx="7" cy="10" r="1.3" />
      <circle cx="13" cy="10" r="1.3" />
      <circle cx="7" cy="15" r="1.3" />
      <circle cx="13" cy="15" r="1.3" />
    </svg>
  )
}
