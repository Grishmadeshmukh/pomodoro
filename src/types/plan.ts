export type PlanItemKind = 'task' | 'routine'
export type RoutineIcon = 'meals' | 'gym' | 'work'

export interface PlanItem {
  id: string
  date: string
  order: number
  kind: PlanItemKind
  taskId?: string
  title?: string
  completed?: boolean
  routineKey?: string
  icon?: RoutineIcon
}

export interface ResolvedPlanItem {
  id: string
  order: number
  kind: PlanItemKind
  title: string
  completed: boolean
  taskId?: string
  routineKey?: string
  icon?: RoutineIcon
}
