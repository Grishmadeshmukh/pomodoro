import type { Task, TaskPriority } from '../../types/pomodoro'

interface TodoListProps {
  tasks: Task[]
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

export function TodoList({ tasks }: TodoListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text">Tasks</h2>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="mt-1 h-4 w-4 rounded accent-tomato"
                  aria-label={`Mark "${task.title}" as complete`}
                />
                <div>
                  <p className="font-medium text-text">{task.title}</p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    ~{task.estimatedMinutes} min
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>

            {task.subtasks.length > 0 && (
              <ul className="mt-3 ml-7 flex flex-col gap-1.5 border-l-2 border-cream-dark pl-4">
                {task.subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      readOnly
                      className="h-3.5 w-3.5 rounded accent-tomato"
                      aria-label={`Mark subtask "${subtask.title}" as complete`}
                    />
                    <span
                      className={`text-sm ${subtask.completed ? 'text-text-muted line-through' : 'text-text'}`}
                    >
                      {subtask.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-text-muted">
        Task management coming soon — this is placeholder UI
      </p>
    </div>
  )
}
