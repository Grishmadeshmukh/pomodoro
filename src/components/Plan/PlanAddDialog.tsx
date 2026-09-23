import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Task } from '../../types'
import { ADDABLE_ROUTINES, type RoutinePreset } from '../../utils/defaultRoutine'
import { RoutineIconImage } from './RoutineIconImage'

type AddMode = 'choose' | 'new-task' | 'existing-task' | 'routine'

interface PlanAddDialogProps {
  open: boolean
  tasks: Task[]
  planTaskIds: Set<string>
  planSubtaskIds: Set<string>
  onClose: () => void
  onAddRoutine: (preset: RoutinePreset) => void
  onAddCustomRoutine: (title: string) => void
  onAddExistingTask: (task: Task, subtaskId?: string) => void
  onCreateTask: (title: string, addToTasks: boolean) => void
}

export function PlanAddDialog({
  open,
  tasks,
  planTaskIds,
  planSubtaskIds,
  onClose,
  onAddRoutine,
  onAddCustomRoutine,
  onAddExistingTask,
  onCreateTask,
}: PlanAddDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<AddMode>('choose')
  const [title, setTitle] = useState('')
  const [addToTasks, setAddToTasks] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      setMode('choose')
      setTitle('')
      setAddToTasks(false)
      if (!dialog.open) dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return
    if (mode === 'new-task') onCreateTask(nextTitle, addToTasks)
    if (mode === 'routine') onAddCustomRoutine(nextTitle)
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="plan-add-title"
      className="m-auto w-[min(calc(100%-2rem),26rem)] max-h-[90vh] overflow-y-auto rounded-3xl border-0 bg-cream p-0 shadow-2xl backdrop:bg-text/40"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <form className="px-5 pt-5 pb-6" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-3">
          <h2 id="plan-add-title" className="text-lg font-semibold text-text">
            Add to today&apos;s plan
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>

        {mode === 'choose' ? (
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-text shadow-sm hover:ring-2 hover:ring-tomato/30"
              onClick={() => setMode('new-task')}
            >
              Create a new task
            </button>
            <button
              type="button"
              className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-text shadow-sm hover:ring-2 hover:ring-tomato/30"
              onClick={() => setMode('existing-task')}
            >
              Pick an existing task
            </button>
            <button
              type="button"
              className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-text shadow-sm hover:ring-2 hover:ring-tomato/30"
              onClick={() => setMode('routine')}
            >
              Add a routine item
            </button>
          </div>
        ) : null}

        {mode === 'new-task' ? (
          <>
            <label className="mt-5 block text-sm font-medium text-text">
              Title
              <input
                required
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-xl border border-cream-dark bg-white px-3 py-2 text-sm text-text outline-none focus:border-tomato"
              />
            </label>
            <label className="mt-4 flex items-start gap-3 text-sm text-text">
              <input
                type="checkbox"
                checked={addToTasks}
                onChange={(event) => setAddToTasks(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-tomato"
              />
              <span>
                Also add this to the Tasks tab
                <span className="mt-0.5 block text-xs text-text-muted">
                  Leave unchecked to keep it only in today&apos;s plan
                </span>
              </span>
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-tomato py-3 text-sm font-semibold text-white shadow-sm hover:bg-tomato-dark"
            >
              Add task
            </button>
          </>
        ) : null}

        {mode === 'routine' ? (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {ADDABLE_ROUTINES.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white px-3 py-4 text-sm font-medium text-text shadow-sm hover:ring-2 hover:ring-tomato/30"
                  onClick={() => {
                    onAddRoutine(preset)
                    onClose()
                  }}
                >
                  {preset.icon ? <RoutineIconImage icon={preset.icon} size={44} /> : null}
                  {preset.title}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-sm font-medium text-text">
              Or add another routine
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Breakfast, stretch, walk…"
                className="mt-1 w-full rounded-xl border border-cream-dark bg-white px-3 py-2 text-sm text-text outline-none focus:border-tomato"
              />
            </label>
            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-tomato py-3 text-sm font-semibold text-white shadow-sm hover:bg-tomato-dark"
            >
              Add routine
            </button>
          </>
        ) : null}

        {mode === 'existing-task' ? (
          <ul className="mt-5 flex flex-col gap-2">
            {tasks.length === 0 ? (
              <li className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-text-muted">
                No tasks yet. Create one or add a plan-only task.
              </li>
            ) : (
              tasks.map((task) => {
                const wholeInPlan = planTaskIds.has(task.id)
                if (task.subtasks.length === 0) {
                  return (
                    <li key={task.id}>
                      <button
                        type="button"
                        className="w-full rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-text shadow-sm hover:ring-2 hover:ring-tomato/30"
                        onClick={() => {
                          onAddExistingTask(task)
                          onClose()
                        }}
                      >
                        {task.title}
                        {wholeInPlan ? (
                          <span className="mt-0.5 block text-xs font-normal text-text-muted">
                            In today&apos;s plan
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                }

                return (
                  <li key={task.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-sm font-medium text-text">{task.title}</p>
                    <div className="mt-2 flex flex-col gap-1">
                      <button
                        type="button"
                        className="rounded-xl px-3 py-2 text-left text-sm text-text hover:bg-cream"
                        onClick={() => {
                          onAddExistingTask(task)
                          onClose()
                        }}
                      >
                        Add whole task
                        {wholeInPlan ? (
                          <span className="mt-0.5 block text-xs text-text-muted">
                            In today&apos;s plan
                          </span>
                        ) : null}
                      </button>
                      {task.subtasks.map((subtask) => {
                        const inPlan = planSubtaskIds.has(subtask.id)
                        return (
                          <button
                            key={subtask.id}
                            type="button"
                            className="rounded-xl px-3 py-2 text-left text-sm text-text hover:bg-cream"
                            onClick={() => {
                              onAddExistingTask(task, subtask.id)
                              onClose()
                            }}
                          >
                            {subtask.title}
                            {inPlan ? (
                              <span className="mt-0.5 block text-xs text-text-muted">
                                In today&apos;s plan
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        ) : null}
      </form>
    </dialog>
  )
}
