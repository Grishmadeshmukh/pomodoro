import { useState } from 'react'
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

interface TodayPlanProps {
  items: PlanItem[]
  resolved: ResolvedPlanItem[]
  tasks: Task[]
  upNextId?: string
  onAddRoutine: (preset: RoutinePreset, atIndex: number) => void
  onAddCustomRoutine: (title: string, atIndex: number) => void
  onAddTask: (task: Task, atIndex: number) => void
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
  const [insertIndex, setInsertIndex] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingLocal, setEditingLocal] = useState<PlanItem | null>(null)
  const [pendingRemove, setPendingRemove] = useState<{
    id: string
    title: string
  } | null>(null)

  const tasksById = new Map(tasks.map((task) => [task.id, task]))

  function openAdd(index: number) {
    setInsertIndex(index)
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
        <div>
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

            return (
              <div key={item.id}>
                {item.kind === 'task' && item.taskId ? (
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
        onClose={() => setInsertIndex(null)}
        onAddRoutine={(preset) => onAddRoutine(preset, atIndex)}
        onAddCustomRoutine={(title) => onAddCustomRoutine(title, atIndex)}
        onAddExistingTask={(task) => onAddTask(task, atIndex)}
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
