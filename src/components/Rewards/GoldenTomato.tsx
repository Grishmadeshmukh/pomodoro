import { Tomato } from '../Tomato/Tomato'

interface GoldenTomatoCardProps {
  earned: boolean
  completedCount: number
  totalCount: number
}

export function GoldenTomatoCard({
  earned,
  completedCount,
  totalCount,
}: GoldenTomatoCardProps) {
  const empty = totalCount === 0

  return (
    <section className="rounded-2xl bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Tomato
          variant={earned ? 'golden' : 'default'}
          size={48}
          className={earned ? 'animate-celebrate' : 'opacity-40'}
          alt=""
        />
        <div>
          <p className="text-sm text-text-muted">Golden Tomato</p>
          {earned ? (
            <p className="mt-1 font-semibold text-gold">Earned for today</p>
          ) : empty ? (
            <p className="mt-1 font-medium text-text">
              Add items to today's plan to unlock it
            </p>
          ) : (
            <p className="mt-1 font-medium text-text">
              Complete every item ({completedCount}/{totalCount})
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
