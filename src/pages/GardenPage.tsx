import { StatsCard } from '../components/Common/StatsCard'
import { MilestoneList } from '../components/Rewards/MilestoneList'
import { Tomato } from '../components/Tomato/Tomato'
import { TomatoGarden } from '../components/Tomato/TomatoGarden'
import { useDailyProgress } from '../hooks/useDailyProgress'
import { useFocusSessions } from '../hooks/useFocusSessions'
import { useTasks } from '../hooks/useTasks'
import type { Milestone } from '../types'
import { formatMinutes } from '../utils/dateUtils'
import {
  averageSessionMinutes,
  sumAllProgress,
  sumProgressSince,
  weekStartKey,
} from '../utils/sessionHistory'
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from '../utils/streakCalculations'
import { formatTomatoCount } from '../utils/tomatoCalculations'

const HARVEST_GOALS = [
  { id: 'm1', name: 'First Harvest', description: 'Grow 10 tomatoes', tomatoes: 10 },
  { id: 'm2', name: 'Getting Started', description: 'Grow 50 tomatoes', tomatoes: 50 },
  { id: 'm3', name: 'Growing Strong', description: 'Grow 100 tomatoes', tomatoes: 100 },
  { id: 'm4', name: 'Flourishing', description: 'Grow 500 tomatoes', tomatoes: 500 },
  { id: 'm5', name: 'Tomato Master', description: 'Grow 1,000 tomatoes', tomatoes: 1000 },
] as const

function harvestMilestones(totalTomatoes: number): Milestone[] {
  return HARVEST_GOALS.map((goal) => ({
    id: goal.id,
    name: goal.name,
    description: goal.description,
    requirement: `${goal.tomatoes.toLocaleString()} tomatoes`,
    progress: Math.min(1, totalTomatoes / goal.tomatoes),
    completed: totalTomatoes >= goal.tomatoes,
  }))
}

const HARVEST_BASKETS = [
  {
    id: 'golden',
    label: 'Golden tomatoes',
    src: '/goldenbasket.svg',
  },
  {
    id: 'week',
    label: "This week's tomatoes",
    src: '/weeklybasket.svg',
  },
  {
    id: 'total',
    label: 'Total tomatoes',
    src: '/totalbasket.svg',
  },
] as const

function HarvestBasket({
  label,
  value,
  src,
}: {
  label: string
  value: number
  src: string
}) {
  const count = value.toLocaleString()

  return (
    <article
      className="flex flex-col items-center rounded-2xl bg-white px-3 py-4 text-center shadow-sm"
      aria-label={`${label}, ${formatTomatoCount(value)}`}
    >
      <h3 className="min-h-10 text-base font-bold leading-tight text-text">{label}</h3>
      <img
        src={src}
        alt=""
        className="mt-2 h-14 w-14 select-none object-contain"
        draggable={false}
      />
      <p className="mt-2 text-sm font-semibold text-[#5c3a24]">{count}</p>
    </article>
  )
}

const EMOTION_TOMATOES = [
  { variant: 'smiling' as const, name: 'Smiling', note: 'Ready to focus' },
  { variant: 'energised' as const, name: 'Energised', note: 'In the zone' },
  { variant: 'sleepy' as const, name: 'Sleepy', note: 'Needs a pause' },
  { variant: 'joyous' as const, name: 'Joyous', note: 'Session complete' },
  { variant: 'crying' as const, name: 'Crying', note: 'Timer reset' },
  { variant: 'angry' as const, name: 'Angry', note: 'Session ended early' },
]

export function GardenPage() {
  const { sessions } = useFocusSessions()
  const { tasks } = useTasks()
  const { holidayDates, goldenDates } = useDailyProgress()
  const { tomatoes: totalTomatoes, focusMinutes: totalFocusMinutes } =
    sumAllProgress(sessions)
  const week = sumProgressSince(sessions, weekStartKey())
  const harvestValues = {
    golden: goldenDates.length,
    week: week.tomatoes,
    total: totalTomatoes,
  }
  const currentStreak = calculateCurrentStreak(sessions, holidayDates)
  const longestStreak = calculateLongestStreak(sessions, holidayDates)
  const tasksCompleted = tasks.filter((task) => task.completed).length
  const averageMinutes = averageSessionMinutes(sessions)

  return (
    <div className="flex flex-col gap-8">
      <TomatoGarden
        tomatoCount={totalTomatoes}
        focusMinutes={totalFocusMinutes}
      />

      <p className="text-center text-sm text-text-muted">
        {formatMinutes(totalFocusMinutes)} focused time
      </p>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-text">Harvest</h2>
        <div className="grid grid-cols-3 items-stretch gap-3">
          {HARVEST_BASKETS.map((basket) => (
            <HarvestBasket
              key={basket.id}
              label={basket.label}
              value={harvestValues[basket.id]}
              src={basket.src}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-text">Growth</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            label="Total focus"
            value={formatMinutes(totalFocusMinutes)}
            icon="⏱"
          />
          <StatsCard
            label="Average session"
            value={sessions.length === 0 ? '—' : formatMinutes(averageMinutes)}
            icon="⏱"
          />
          <StatsCard
            label="Focus sessions"
            value={String(sessions.length)}
            icon="🎯"
          />
          <StatsCard
            label="Tasks completed"
            value={String(tasksCompleted)}
            icon="🎯"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-text">Streaks</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            label="Current streak"
            value={`${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`}
            icon="🔥"
          />
          <StatsCard
            label="Longest streak"
            value={`${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}`}
            icon="🏆"
          />
        </div>
      </section>

      <MilestoneList milestones={harvestMilestones(totalTomatoes)} />

      <section className="rounded-2xl bg-white px-5 py-4 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Tomato collection</h2>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Tomato size={32} alt="" />
            <div>
              <p className="font-medium text-text">Standard Tomato</p>
              <p className="text-sm text-text-muted">
                Grown from focused time · {formatTomatoCount(totalTomatoes)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tomato variant="golden" size={32} alt="" />
            <div>
              <p className="font-medium text-text">Golden Tomato</p>
              <p className="text-sm text-text-muted">
                {goldenDates.length === 0
                  ? 'Finish today\'s plan to earn one'
                  : formatTomatoCount(goldenDates.length)}
              </p>
            </div>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-3">
            {EMOTION_TOMATOES.map((tomato) => (
              <div key={tomato.variant} className="flex items-center gap-2">
                <Tomato variant={tomato.variant} size={28} alt="" />
                <div>
                  <p className="text-sm font-medium text-text">{tomato.name}</p>
                  <p className="text-xs text-text-muted">{tomato.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
