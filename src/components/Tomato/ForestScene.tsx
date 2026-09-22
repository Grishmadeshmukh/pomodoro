import { layoutHourTreesFromHours } from '../../utils/gardenVisual'

interface ForestSceneProps {
  hours: number
  compact?: boolean
}

export function ForestScene({ hours, compact = false }: ForestSceneProps) {
  const trees = layoutHourTreesFromHours(hours)

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-white ${
        compact ? 'aspect-[24/5]' : ''
      }`}
      style={compact ? undefined : { aspectRatio: '3697 / 762' }}
      role="img"
      aria-label={
        hours === 0
          ? 'Bare garden soil'
          : `Garden with ${hours} ${hours === 1 ? 'hour' : 'hours'} of trees`
      }
    >
      {trees.map((tree) => (
        <img
          key={tree.key}
          src={tree.src}
          alt=""
          className="pointer-events-none absolute max-w-none origin-bottom"
          style={{
            left: `${tree.leftPct}%`,
            bottom: `${tree.bottomPct}%`,
            height: `${tree.heightPct}%`,
            width: 'auto',
            transform: 'translateX(-50%)',
            zIndex: tree.zIndex,
          }}
        />
      ))}
      <img
        src="/ground.svg"
        alt=""
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[26.5%] w-full object-fill"
      />
    </div>
  )
}
