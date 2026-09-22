import type { Milestone } from '../../types'

interface MilestoneListProps {
  milestones: Milestone[]
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text">Milestones</h2>
      <ul className="flex flex-col gap-2">
        {milestones.map((milestone) => (
          <li
            key={milestone.id}
            className="rounded-2xl bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-text">{milestone.name}</p>
                <p className="text-sm text-text-muted">{milestone.description}</p>
              </div>
              <span className="shrink-0 text-sm font-medium text-tomato">
                {milestone.completed
                  ? 'Done'
                  : `${Math.round(milestone.progress * 100)}%`}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-dark">
              <div
                className="h-full rounded-full bg-tomato"
                style={{ width: `${Math.round(milestone.progress * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
