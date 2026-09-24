import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getSavedRoutines } from '../../repositories/savedRoutineRepository'
import type { Task } from '../../types'
import { ADDABLE_ROUTINES, type RoutinePreset } from '../../utils/defaultRoutine'
import { RoutineIconImage } from './RoutineIconImage'

type AddMode = 'choose' | 'new-task' | 'existing-task' | 'routine'

interface PlanAddDialogProps {
  open: boolean
  tasks: Task[]
  planTaskIds: Set<string>
  planSubtaskIds: Set<string>
  routineKeys: Set<string>
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
  routineKeys,
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
  const [savedRoutines, setSavedRoutines] = useState<RoutinePreset[]>([])
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set())

  const routineChoices = [
    ...ADDABLE_ROUTINES,
    ...savedRoutines.filter(
      (routine) => !ADDABLE_ROUTINES.some((preset) => preset.key === routine.key),
    ),
  ]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      setMode('choose')
      setTitle('')
      setAddToTasks(false)
      setSavedRoutines(getSavedRoutines())
      setExpandedTaskIds(new Set())
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
              {routineChoices.map((preset) => (
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
                  {routineKeys.has(preset.key) ? (
                    <span className="-mt-1 text-xs font-normal text-text-muted">
                      In today&apos;s plan
                    </span>
                  ) : null}
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

                const expanded = expandedTaskIds.has(task.id)
                return (
                  <li key={task.id} className="rounded-2xl bg-white shadow-sm">
                    <div className="flex items-stretch">
                      <button
                        type="button"
                        className="min-w-0 flex-1 rounded-l-2xl px-4 py-3 text-left text-sm font-medium text-text hover:bg-cream"
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
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-label={
                          expanded
                            ? `Hide subtasks for "${task.title}"`
                            : `Show subtasks for "${task.title}"`
                        }
                        className="shrink-0 rounded-r-2xl px-3 text-text-muted hover:bg-cream hover:text-text"
                        onClick={() => {
                          setExpandedTaskIds((current) => {
                            const next = new Set(current)
                            if (next.has(task.id)) next.delete(task.id)
                            else next.add(task.id)
                            return next
                          })
                        }}
                      >
                        <Chevron open={expanded} />
                      </button>
                    </div>
                    {expanded ? (
                      <div className="flex flex-col gap-1 border-t border-cream-dark px-2 py-2">
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
                    ) : null}
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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="currentColor"
    >
      <path d="M7.2 4.5a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L11.67 10 7.2 5.56a.75.75 0 0 1 0-1.06Z" />
    </svg>
  )
}
