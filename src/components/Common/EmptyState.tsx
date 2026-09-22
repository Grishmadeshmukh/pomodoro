import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center shadow-sm">
      {icon ? (
        <div className="text-4xl" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h2 className={`text-lg font-semibold text-text ${icon ? 'mt-4' : ''}`}>{title}</h2>
      <p className="mt-2 max-w-xs text-sm text-text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
