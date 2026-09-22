import type { ReactNode } from 'react'

export interface StatsBannerItem {
  label: string
  value: string
  icon: ReactNode
}

interface StatsBannerProps {
  items: StatsBannerItem[]
}

export function StatsBanner({ items }: StatsBannerProps) {
  return (
    <div
      className="flex w-full items-center justify-between gap-1 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-md"
      aria-label="Today's stats"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1"
        >
          <div className="flex items-center gap-1 text-text">
            <span className="flex h-4 w-4 items-center justify-center text-sm" aria-hidden="true">
              {item.icon}
            </span>
            <span className="truncate text-sm font-semibold tabular-nums">
              {item.value}
            </span>
          </div>
          <span className="text-[10px] leading-none text-text-muted">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
