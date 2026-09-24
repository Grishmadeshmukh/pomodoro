import { useState } from 'react'
import { Confetti } from '../components/Rewards/Confetti'
import { CompletedTaskDialog } from '../components/Tasks/CompletedTaskDialog'
import { TaskFormDialog } from '../components/Tasks/TaskFormDialog'
import { TaskList } from '../components/Tasks/TaskList'
import { useTasks } from '../hooks/useTasks'
import { useTodayPlan } from '../hooks/useTodayPlan'
import { getTasks } from '../repositories/taskRepository'
import type { Task } from '../types'

export function TasksPage() {
  const { tasks, saveTask, deleteTask, toggleTask, toggleSubtask, reorderTasks } = useTasks()
  const { planTaskIds, planSubtaskIds, appendTask, appendSubtask } = useTodayPlan()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [finishedTask, setFinishedTask] = useState<Task | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function handleToggle(id: string) {
    const completed = toggleTask(id)
    if (completed) {
      setCelebrate(true)
      window.setTimeout(() => setCelebrate(false), 900)
      setFinishedTask(tasks.find((task) => task.id === id) ?? null)
    }
  }

  function handleDelete(task: Task) {
    if (window.confirm(`Delete “${task.title}”?`)) deleteTask(task.id)
  }

  const newTaskButton = (
    <button
      type="button"
      onClick={openCreate}
      className="shrink-0 rounded-xl bg-tomato px-3 py-2 text-sm font-medium text-white hover:bg-tomato-dark"
    >
      + New Task
    </button>
  )

  return (
    <div className="flex flex-col gap-6">
      <Confetti active={celebrate} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text">Tasks</h2>
          <p className="mt-1 text-sm text-text-muted">
            Drag the handle to reorder. Add a task or a subtask to today&apos;s plan.
          </p>
        </div>
        {newTaskButton}
      </div>

      <TaskList
        tasks={tasks}
        planTaskIds={planTaskIds}
        planSubtaskIds={planSubtaskIds}
        emptyAction={newTaskButton}
        onToggle={handleToggle}
        onToggleSubtask={toggleSubtask}
        onEdit={(task) => {
          setEditing(task)
          setFormOpen(true)
        }}
        onDelete={handleDelete}
        onAddToPlan={appendTask}
        onAddSubtaskToPlan={appendSubtask}
        onReorder={reorderTasks}
      />

      <TaskFormDialog
        open={formOpen}
        task={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={saveTask}
      />

      <CompletedTaskDialog
        open={finishedTask !== null}
        title={finishedTask?.title ?? ''}
        onClose={() => setFinishedTask(null)}
        onDelete={() => {
          if (finishedTask) deleteTask(finishedTask.id)
          setFinishedTask(null)
        }}
        onAddSubtasks={() => {
          if (!finishedTask) return
          const latest = getTasks().find((task) => task.id === finishedTask.id) ?? finishedTask
          setEditing(latest)
          setFormOpen(true)
          setFinishedTask(null)
        }}
      />
    </div>
  )
}
