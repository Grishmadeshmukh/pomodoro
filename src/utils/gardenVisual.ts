export const MINUTES_PER_HOUR_TREE = 60
export const TOMATOES_PER_GARDEN_HOUR = 10
export const HOUR_TREE_CYCLE = 6
export const MAX_VISIBLE_HOUR_TREES = 18

/** Positions and heights taken from `public/hourly growth.png` (trees + ground, no labels). */
const HOUR_SLOTS = [
  { src: '/hour1.png', leftPct: 6.3, heightPct: 42 },
  { src: '/hour2.svg', leftPct: 17.6, heightPct: 50 },
  { src: '/hour3.svg', leftPct: 31.9, heightPct: 50.3 },
  { src: '/hour4.svg', leftPct: 49.4, heightPct: 58.5 },
  { src: '/hour5.svg', leftPct: 69.9, heightPct: 73.2 },
  { src: '/hour6.svg', leftPct: 90.7, heightPct: 67.1 },
] as const

export function completedFocusHours(focusMinutes: number): number {
  return Math.max(0, Math.floor(focusMinutes / MINUTES_PER_HOUR_TREE))
}

/** 10 tomatoes plant hour 1 (a sapling). Weekend 2× tomatoes advance the garden twice as far. */
export function gardenHoursFromTomatoes(tomatoes: number): number {
  if (!Number.isFinite(tomatoes) || tomatoes <= 0) return 0
  return Math.floor(tomatoes / TOMATOES_PER_GARDEN_HOUR)
}

export interface PlantedHourTree {
  key: string
  src: string
  leftPct: number
  bottomPct: number
  heightPct: number
  zIndex: number
}

function plantVisual(stage: number, leftPct: number, key: string): PlantedHourTree {
  const slot = HOUR_SLOTS[stage - 1]

  return {
    key,
    src: slot.src,
    leftPct,
    bottomPct: 18,
    heightPct: slot.heightPct * 1.1,
    zIndex: 8 + Math.round(leftPct / 10),
  }
}

function bedPositions(count: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [50]
  if (count === 2) return [38, 66]
  const start = 22
  const end = 78
  const step = (end - start) / (count - 1)
  return Array.from({ length: count }, (_, index) => start + step * index)
}

/** Hours 1–6 replace the same plant’s stage; hour 7 keeps hour6 and plants a new sapling. */
export function layoutHourTrees(focusMinutes: number): PlantedHourTree[] {
  const hours = Math.min(completedFocusHours(focusMinutes), MAX_VISIBLE_HOUR_TREES)
  if (hours === 0) return []

  const matureCount = Math.floor(hours / HOUR_TREE_CYCLE)
  const growingStage = hours % HOUR_TREE_CYCLE
  const stages: number[] = [
    ...Array.from({ length: matureCount }, () => HOUR_TREE_CYCLE),
    ...(growingStage > 0 ? [growingStage] : []),
  ]
  const lefts = bedPositions(stages.length)

  return stages.map((stage, index) =>
    plantVisual(stage, lefts[index], `plant-${index}-stage-${stage}`),
  )
}

export function layoutHourTreesFromHours(hours: number): PlantedHourTree[] {
  return layoutHourTrees(Math.max(0, Math.floor(hours)) * MINUTES_PER_HOUR_TREE)
}
