import type { PlanItem, ResolvedPlanItem, Task } from '../types'

export function resolvePlanItems(
  planItems: PlanItem[],
  tasks: Task[],
): ResolvedPlanItem[] {
  const tasksById = new Map(tasks.map((task) => [task.id, task]))

  return [...planItems]
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      if (item.kind === 'task' && item.taskId) {
        const task = tasksById.get(item.taskId)
        return {
          id: item.id,
          order: item.order,
          kind: item.kind,
          taskId: item.taskId,
          title: task?.title ?? item.title ?? 'Unknown task',
          completed: task?.completed ?? item.completed ?? false,
        }
      }

      return {
        id: item.id,
        order: item.order,
        kind: item.kind,
        taskId: item.taskId,
        title: item.title ?? (item.kind === 'task' ? 'Task' : 'Routine'),
        completed: item.completed ?? false,
        routineKey: item.routineKey,
        icon: item.icon,
      }
    })
}

export function getUpNextItem(
  items: ResolvedPlanItem[],
): ResolvedPlanItem | undefined {
  return items.find((item) => !item.completed)
}

export function reindexPlanItems(items: PlanItem[]): PlanItem[] {
  return items.map((item, index) => ({ ...item, order: index }))
}

export function insertPlanItem(
  items: PlanItem[],
  newItem: Omit<PlanItem, 'order'>,
  atIndex: number,
): PlanItem[] {
  const sorted = [...items].sort((a, b) => a.order - b.order)
  const clampedIndex = Math.max(0, Math.min(atIndex, sorted.length))
  const next = [...sorted]
  next.splice(clampedIndex, 0, { ...newItem, order: clampedIndex })
  return reindexPlanItems(next)
}

export function movePlanItem(
  items: PlanItem[],
  fromIndex: number,
  toIndex: number,
): PlanItem[] {
  const sorted = [...items].sort((a, b) => a.order - b.order)
  if (
    fromIndex < 0 ||
    fromIndex >= sorted.length ||
    toIndex < 0 ||
    toIndex >= sorted.length
  ) {
    return sorted
  }

  const [moved] = sorted.splice(fromIndex, 1)
  sorted.splice(toIndex, 0, moved)
  return reindexPlanItems(sorted)
}
