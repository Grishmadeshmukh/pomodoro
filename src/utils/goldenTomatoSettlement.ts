import {
  getDailyFlags,
  revokeProvisionalGoldenTomato,
  settleGoldenTomato,
} from '../repositories/dailyProgressRepository'
import {
  getStoredPlan,
  listStoredPlanDates,
  syncLinkedTaskCompletion,
} from '../repositories/planRepository'
import { getTasks } from '../repositories/taskRepository'
import { localDateKey } from './dateUtils'
import { checkGoldenTomatoEligibility } from './rewardService'

export const GOLDEN_TOMATO_SETTLED_EVENT = 'pomodoro:golden-settled'

function planCompleteOn(date: string): boolean {
  const plan = getStoredPlan(date)
  if (!plan) return false
  return checkGoldenTomatoEligibility(
    plan.map((item) => ({ completed: item.completed === true })),
  )
}

/**
 * Lock golden tomatoes for days that have already ended.
 * Today's award stays provisional so an accidental check can still be undone.
 */
export function settleElapsedGoldenTomatoes(today = localDateKey(new Date())): void {
  const tasks = getTasks()
  syncLinkedTaskCompletion(
    today,
    tasks.map((task) => ({ id: task.id, completed: task.completed })),
  )

  let changed = revokeProvisionalGoldenTomato(today)

  for (const date of listStoredPlanDates()) {
    if (date >= today) continue
    if (getDailyFlags(date).goldenSettled) continue
    settleGoldenTomato(date, planCompleteOn(date))
    changed = true
  }

  if (changed && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GOLDEN_TOMATO_SETTLED_EVENT))
  }
}
