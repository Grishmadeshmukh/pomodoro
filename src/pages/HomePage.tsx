import { useEffect, useRef, useState } from 'react'
import { TodayPlan } from '../components/Plan/TodayPlan'
import { StatsBanner } from '../components/Common/StatsBanner'
import { Confetti } from '../components/Rewards/Confetti'
import { GoldenTomatoCard } from '../components/Rewards/GoldenTomato'
import { RewardMetaBar } from '../components/Rewards/RewardMetaBar'
import { TomatoSplash } from '../components/Rewards/TomatoSplash'
import { TimerControls } from '../components/Timer/TimerControls'
import { TimerDisplay } from '../components/Timer/TimerDisplay'
import { Tomato } from '../components/Tomato/Tomato'
import { TomatoCharacter } from '../components/Tomato/TomatoCharacter'
import { TomatoCounter } from '../components/Tomato/TomatoCounter'
import { TomatoGarden } from '../components/Tomato/TomatoGarden'
import { useDailyProgress } from '../hooks/useDailyProgress'
import { useFocusSessions } from '../hooks/useFocusSessions'
import { useTasks } from '../hooks/useTasks'
import { useTimer } from '../hooks/useTimer'
import { useTodayPlan } from '../hooks/useTodayPlan'
import { formatMinutes, formatTimer } from '../utils/dateUtils'
import { getUpNextItem, resolvePlanItems } from '../utils/planUtils'
import { sumTodayProgress } from '../utils/sessionHistory'
import { calculateCurrentStreak } from '../utils/streakCalculations'
import {
  calculateTomatoes,
  getRewardMultiplier,
  isWeekend,
} from '../utils/tomatoCalculations'

export function HomePage() {
  const { tasks, saveTask, toggleTask, toggleSubtask } = useTasks()
  const plan = useTodayPlan()
  const resolved = resolvePlanItems(plan.items, tasks)
  const upNext = getUpNextItem(resolved)
  const { sessions, addSession } = useFocusSessions()
  const timer = useTimer({ onSessionEnd: addSession })
  const daily = useDailyProgress(plan.date)
  const [celebrate, setCelebrate] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  const now = new Date()
  const today = sumTodayProgress(sessions, now)
  const liveMinutes = timer.elapsedMs / 60000
  const liveTomatoes =
    timer.status === 'idle' || !timer.sessionStartedAt
      ? 0
      : calculateTomatoes(liveMinutes, new Date(timer.sessionStartedAt))
  const todayTomatoes = today.tomatoes + liveTomatoes
  const todayFocusMinutes = today.focusMinutes + (timer.status === 'idle' ? 0 : liveMinutes)
  const completedCount = resolved.filter((item) => item.completed).length
  const { holidayDates } = daily
  const streak = calculateCurrentStreak(sessions, holidayDates, now)
  const weekend = isWeekend(now)
  const multiplier = getRewardMultiplier(now)
  const planComplete = resolved.length > 0 && completedCount === resolved.length
  const planWasComplete = useRef(planComplete)

  useEffect(() => {
    const justFinished = planComplete && !planWasComplete.current
    planWasComplete.current = planComplete
    if (!justFinished) return
    setCelebrate(true)
    const id = window.setTimeout(() => setCelebrate(false), 1200)
    return () => window.clearTimeout(id)
  }, [planComplete])

  function celebrateTask(completed: boolean) {
    if (!completed) return
    setCelebrate(true)
    window.setTimeout(() => setCelebrate(false), 900)
  }

  function celebratePlanIfFinished(completed: boolean, id: string) {
    if (!completed || resolved.length === 0) return
    const unfinishedOthers = resolved.filter((item) => item.id !== id && !item.completed)
    if (unfinishedOthers.length > 0) return
    setShowSplash(true)
    window.setTimeout(() => setShowSplash(false), 3300)
  }

  function handleToggleLocal(id: string) {
    const item = plan.items.find((entry) => entry.id === id)
    if (!item) return false

    if (item.taskId) {
      const completed = toggleTask(item.taskId)
      plan.setItemCompleted(id, completed)
      celebrateTask(completed)
      celebratePlanIfFinished(completed, id)
      return completed
    }

    const completed = plan.toggleLocalItem(id)
    if (item.kind === 'task') celebrateTask(completed)
    celebratePlanIfFinished(completed, id)
    return completed
  }

  return (
    <div className="flex flex-col gap-8">
      <Confetti active={celebrate} />
      <TomatoSplash active={showSplash} />
      <section className="flex flex-col items-center gap-5">
        <StatsBanner
          items={[
            {
              label: 'Tomatoes',
              value: String(todayTomatoes),
              icon: <Tomato size={14} alt="" />,
            },
            {
              label: 'Focused',
              value: formatMinutes(todayFocusMinutes),
            },
            {
              label: 'Planned',
              value: `${completedCount}/${resolved.length}`,
            },
            {
              label: 'Streak',
              value: `${streak}d`,
            },
          ]}
        />
        <RewardMetaBar weekend={weekend} />
        <TomatoCharacter state={timer.tomatoState} size={100} />
        <TimerDisplay
          timeDisplay={formatTimer(timer.remainingMs)}
          sessionType="focus"
          editable={timer.status === 'idle'}
          durationMs={timer.durationMs}
          onDurationChange={timer.setDuration}
        />
        <TimerControls
          status={timer.status}
          onStart={timer.start}
          onPause={timer.pause}
          onResume={timer.resume}
          onReset={timer.reset}
          onEnd={timer.end}
        />
      </section>

      <TodayPlan
        items={plan.items}
        resolved={resolved}
        tasks={tasks}
        upNextId={upNext?.id}
        onAddRoutine={plan.addRoutine}
        onAddCustomRoutine={plan.addCustomRoutine}
        onAddTask={plan.addTask}
        onCreateListedTask={(task, atIndex) => {
          saveTask(task)
          plan.addTask(task, atIndex)
        }}
        onCreatePlanOnlyTask={plan.addPlanOnlyTask}
        onMoveItem={plan.moveItem}
        onRemoveItem={plan.removeItem}
        onToggleLocal={handleToggleLocal}
        onRenameItem={plan.renameItem}
        onToggleSubtask={toggleSubtask}
        onSaveTask={saveTask}
        onStartFocus={() => {
          if (timer.status === 'idle') timer.start()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />

      <TomatoCounter tomatoes={todayTomatoes} goal={10} multiplier={multiplier} />
      <GoldenTomatoCard
        earned={planComplete}
        completedCount={completedCount}
        totalCount={resolved.length}
      />
      <TomatoGarden tomatoCount={todayTomatoes} compact />
    </div>
  )
}
