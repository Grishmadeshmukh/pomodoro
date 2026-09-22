import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Task, TaskPriority } from '../../types'

interface TaskFormValues {
  title: string
  description: string
  priority: TaskPriority
  deadline: string
  subtasks: { id: string; title: string; completed: boolean; completedAt?: string }[]
}

interface TaskFormDialogProps {
  open: boolean
  task?: Task | null
  onClose: () => void
  onSave: (task: Task) => void
}

function emptyForm(): TaskFormValues {
  return {
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    subtasks: [],
  }
}

function fromTask(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    deadline: task.deadline ?? '',
    subtasks: task.subtasks.map((subtask) => ({ ...subtask })),
  }
}

const fieldClass =
  'mt-1 w-full rounded-xl border border-cream-dark bg-white px-3 py-2 text-sm text-text outline-none focus:border-tomato'

export function TaskFormDialog({
  open,
  task,
  onClose,
  onSave,
}: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [form, setForm] = useState<TaskFormValues>(emptyForm)
  const [subtaskDraft, setSubtaskDraft] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setForm(task ? fromTask(task) : emptyForm())
      setSubtaskDraft('')
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open, task])

  function addSubtask() {
    const title = subtaskDraft.trim()
    if (!title) return
    setForm((current) => ({
      ...current,
      subtasks: [
        ...current.subtasks,
        {
          id: crypto.randomUUID(),
          title,
          completed: false,
        },
      ],
    }))
    setSubtaskDraft('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) return

    const now = new Date().toISOString()
    const taskId = task?.id ?? crypto.randomUUID()

    const saved: Task = {
      id: taskId,
      title,
      description: form.description.trim() || undefined,
      priority: form.priority,
      deadline: form.deadline || undefined,
      completed: task?.completed ?? false,
      completedAt: task?.completedAt,
      createdAt: task?.createdAt ?? now,
      subtasks: form.subtasks.map((subtask) => ({
        ...subtask,
        taskId,
        title: subtask.title.trim(),
      })),
    }

    onSave(saved)
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="task-form-title"
      className="m-auto w-[min(calc(100%-2rem),26rem)] max-h-[90vh] overflow-y-auto rounded-3xl border-0 bg-cream p-0 shadow-2xl backdrop:bg-text/40"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <form className="px-5 pt-5 pb-6" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-3">
          <h2 id="task-form-title" className="text-lg font-semibold text-text">
            {task ? 'Edit task' : 'New task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>

        <label className="mt-5 block text-sm font-medium text-text">
          Title
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            className={fieldClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-text">
          Description
          <textarea
            rows={2}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className={fieldClass}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-text">
          Priority
          <select
            value={form.priority}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                priority: event.target.value as TaskPriority,
              }))
            }
            className={fieldClass}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium text-text">
          Deadline
          <input
            type="date"
            value={form.deadline}
            onChange={(event) =>
              setForm((current) => ({ ...current, deadline: event.target.value }))
            }
            className={fieldClass}
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-text">Subtasks</legend>
          <div className="mt-2 flex gap-2">
            <input
              value={subtaskDraft}
              onChange={(event) => setSubtaskDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addSubtask()
                }
              }}
              placeholder="Add a subtask"
              className={fieldClass + ' mt-0'}
            />
            <button
              type="button"
              onClick={addSubtask}
              className="shrink-0 rounded-xl bg-white px-3 text-sm font-medium text-text shadow-sm"
            >
              Add
            </button>
          </div>
          {form.subtasks.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {form.subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm"
                >
                  <span className="text-text">{subtask.title}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        subtasks: current.subtasks.filter(
                          (item) => item.id !== subtask.id,
                        ),
                      }))
                    }
                    className="text-xs text-text-muted hover:text-tomato"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </fieldset>

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-tomato py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-tomato-dark"
        >
          {task ? 'Save task' : 'Create task'}
        </button>
      </form>
    </dialog>
  )
}
