// import { useState } from 'react'
import { ForestScene } from './ForestScene'
// import { GardenHoursPreview } from './GardenHoursPreview'
import { gardenHoursFromTomatoes } from '../../utils/gardenVisual'
import { tomatoNoun } from '../../utils/tomatoCalculations'

interface TomatoGardenProps {
  tomatoCount: number
  compact?: boolean
}

export function TomatoGarden({
  tomatoCount,
  compact = false,
}: TomatoGardenProps) {
  // const [previewHours, setPreviewHours] = useState<number | null>(null)
  // const hours = previewHours ?? actualHours
  const hours = gardenHoursFromTomatoes(tomatoCount)

  return (
    <section
      className={`overflow-hidden rounded-2xl bg-white text-center shadow-sm ${
        compact ? 'px-4 pb-4 pt-4' : 'px-4 pb-5 pt-5'
      }`}
    >
      <h2 className="text-lg font-semibold text-text">
        {compact ? "Today's garden" : 'My Garden'}
      </h2>
      <p className={`${compact ? 'mt-1' : 'mt-2'} text-3xl font-semibold text-tomato`}>
        {tomatoCount.toLocaleString()}
      </p>
      <p className="text-sm text-text-muted">
        {compact
          ? `${tomatoNoun(tomatoCount)} so far today`
          : `${tomatoNoun(tomatoCount)} grown`}
      </p>

      <div className="mt-3 overflow-hidden rounded-xl">
        <ForestScene hours={hours} compact={compact} />
      </div>

      {hours === 0 ? (
        <p className="mt-3 text-sm text-text-muted">
          Grow 10 tomatoes to plant a sapling.
        </p>
      ) : (
        <p className="mt-3 text-sm text-text-muted">
          {hours} {hours === 1 ? 'hour' : 'hours'} of growth
        </p>
      )}

      {/* {compact ? null : (
        <GardenHoursPreview
          hours={hours}
          actualHours={actualHours}
          onChange={setPreviewHours}
          onReset={() => setPreviewHours(null)}
        />
      )} */}
    </section>
  )
}
