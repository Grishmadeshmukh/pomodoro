import type { FocusSession, Milestone, PlanItem, Task } from '../types'
import { calculateTomatoes } from '../utils/tomatoCalculations'

export const PLACEHOLDER_STATS = {
  todayFocusMinutes: 75,
  todayTomatoes: calculateTomatoes(75, new Date('2026-09-21')),
  todaySessionsCompleted: 3,
  planItemsCompleted: 2,
  planItemsTotal: 7,
  currentStreak: 6,
  totalTomatoes: 127,
  totalFocusMinutes: 762,
  longestStreak: 12,
}

export const PLACEHOLDER_TASKS: Task[] = [
  {
    id: '1',
    title: 'Finish reading chapter 3',
    priority: 'high',
    completed: false,
    createdAt: '2026-09-18T09:00:00',
    subtasks: [
      {
        id: '1a',
        taskId: '1',
        title: 'Take notes on key concepts',
        completed: false,
      },
      {
        id: '1b',
        taskId: '1',
        title: 'Review summary questions',
        completed: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Reply to emails',
    priority: 'medium',
    completed: true,
    createdAt: '2026-09-20T09:00:00',
    completedAt: '2026-09-21T10:00:00',
    subtasks: [
      { id: '2a', taskId: '2', title: 'Check inbox', completed: true },
    ],
  },
  {
    id: '3',
    title: 'Plan tomorrow',
    priority: 'low',
    completed: false,
    createdAt: '2026-09-21T08:00:00',
    subtasks: [],
  },
]

export const PLACEHOLDER_PLAN: PlanItem[] = [
  {
    id: 'p-breakfast',
    date: '2026-09-21',
    order: 0,
    kind: 'routine',
    title: 'Breakfast',
    completed: true,
  },
  {
    id: 'p-1',
    date: '2026-09-21',
    order: 1,
    kind: 'task',
    taskId: '2',
  },
  {
    id: 'p-2',
    date: '2026-09-21',
    order: 2,
    kind: 'task',
    taskId: '1',
  },
  {
    id: 'p-lunch',
    date: '2026-09-21',
    order: 3,
    kind: 'routine',
    title: 'Lunch',
    completed: false,
  },
  {
    id: 'p-gym',
    date: '2026-09-21',
    order: 4,
    kind: 'routine',
    title: 'Gym',
    completed: false,
  },
  {
    id: 'p-3',
    date: '2026-09-21',
    order: 5,
    kind: 'task',
    taskId: '3',
  },
  {
    id: 'p-dinner',
    date: '2026-09-21',
    order: 6,
    kind: 'routine',
    title: 'Dinner',
    completed: false,
  },
]

export const PLACEHOLDER_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    name: 'First Harvest',
    description: 'Grow 10 tomatoes',
    requirement: '10 tomatoes',
    progress: 1,
    completed: true,
  },
  {
    id: 'm2',
    name: 'Greenhouse',
    description: 'Grow 100 tomatoes',
    requirement: '100 tomatoes',
    progress: 1,
    completed: true,
  },
  {
    id: 'm3',
    name: 'Orchard',
    description: 'Grow 250 tomatoes',
    requirement: '250 tomatoes',
    progress: 127 / 250,
    completed: false,
  },
]

export const PLACEHOLDER_HISTORY: { label: string; sessions: FocusSession[] }[] =
  [
    {
      label: 'Today',
      sessions: [
        {
          id: '1',
          startedAt: '2026-09-21T09:00:00',
          endedAt: '2026-09-21T09:25:00',
          durationMinutes: 25,
          completed: true,
          tomatoesEarned: calculateTomatoes(25, new Date('2026-09-21T09:00:00')),
          sessionType: 'focus',
        },
        {
          id: '2',
          startedAt: '2026-09-21T10:00:00',
          endedAt: '2026-09-21T10:25:00',
          durationMinutes: 25,
          completed: true,
          tomatoesEarned: calculateTomatoes(25, new Date('2026-09-21T10:00:00')),
          sessionType: 'focus',
        },
        {
          id: '3',
          startedAt: '2026-09-21T11:00:00',
          endedAt: '2026-09-21T11:25:00',
          durationMinutes: 25,
          completed: true,
          tomatoesEarned: calculateTomatoes(25, new Date('2026-09-21T11:00:00')),
          sessionType: 'focus',
        },
      ],
    },
    {
      label: 'Yesterday',
      sessions: [
        {
          id: '4',
          startedAt: '2026-09-20T14:00:00',
          endedAt: '2026-09-20T14:25:00',
          durationMinutes: 25,
          completed: true,
          tomatoesEarned: calculateTomatoes(25, new Date('2026-09-20T14:00:00')),
          sessionType: 'focus',
        },
      ],
    },
  ]
