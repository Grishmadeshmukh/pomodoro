import { HOUR_TREE_CYCLE, layoutHourTreesFromHours } from '../../utils/gardenVisual'
import type { PlantedHourTree } from '../../utils/gardenVisual'

interface ForestSceneProps {
  hours: number
  compact?: boolean
}

const SCENIC_PLANT_LIMIT = 6
const ORCHARD_COLUMNS = 5
const TALLEST_STAGE_PCT = 73.2 * 1.1

function gardenLabel(hours: number, plantCount: number): string {
  if (hours === 0) return 'Bare garden soil'
  const fullTrees = Math.floor(hours / HOUR_TREE_CYCLE)
  const hourLabel = `${hours} ${hours === 1 ? 'hour' : 'hours'} of focus`
  if (fullTrees === 0) return `Garden after ${hourLabel}`
  const treeLabel = `${fullTrees} full ${fullTrees === 1 ? 'tree' : 'trees'}`
  const growing = plantCount > fullTrees
  return growing
    ? `Garden with ${treeLabel} and one still growing, from ${hourLabel}`
    : `Garden with ${treeLabel} from ${hourLabel}`
}

function ScenicBed({
  trees,
  hours,
  compact,
}: {
  trees: PlantedHourTree[]
  hours: number
  compact: boolean
}) {
  return (
    <div
      className={`relative isolate w-full overflow-hidden rounded-xl bg-white ${
        compact ? 'aspect-[24/5]' : ''
      }`}
      style={compact ? undefined : { aspectRatio: '3697 / 762' }}
      role="img"
      aria-label={gardenLabel(hours, trees.length)}
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

export function ForestScene({ hours, compact = false }: ForestSceneProps) {
  const trees = layoutHourTreesFromHours(hours)

  if (trees.length <= SCENIC_PLANT_LIMIT) {
    return <ScenicBed trees={trees} hours={hours} compact={compact} />
  }

  return (
    <div
      className="relative isolate w-full overflow-hidden rounded-xl bg-white"
      role="img"
      aria-label={gardenLabel(hours, trees.length)}
    >
      <div
        className="grid items-end gap-x-1 gap-y-1 px-2 pt-3"
        style={{ gridTemplateColumns: `repeat(${ORCHARD_COLUMNS}, minmax(0, 1fr))` }}
      >
        {trees.map((tree) => (
          <div
            key={tree.key}
            className={`flex items-end justify-center ${compact ? 'h-12' : 'h-[4.75rem]'}`}
          >
            <img
              src={tree.src}
              alt=""
              className="w-auto max-w-full object-contain object-bottom"
              style={{ height: `${(tree.heightPct / TALLEST_STAGE_PCT) * 100}%` }}
              draggable={false}
            />
          </div>
        ))}
      </div>
      <img
        src="/ground.svg"
        alt=""
        className="pointer-events-none h-8 w-full object-fill"
        draggable={false}
      />
    </div>
  )
}
