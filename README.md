# 🍅 Pomodoro

> Focus. Grow. Repeat.

Pomodoro is a focus/productivity web app built around a simple reward loop:

**Focus → grow tomatoes → complete tasks → unlock rewards → build your garden.**

The first version should prioritize a simple, pleasant Pomodoro timer and task workflow. Gamification should make focused work feel rewarding without becoming a distraction.

---

## 1. Product Vision

Pomodoro helps users focus by turning focused time into a visible collection of tomatoes.

The core idea:

```text
        FOCUS
          ↓
      🍅 TOMATOES
          ↓
       🌱 GROWTH
          ↓
      🏆 MILESTONES
          ↓
       🌳 GARDEN
```



### Product principles

1. Productivity comes first.
2. Reward progress, not perfection.
3. Make progress visually tangible.
4. Give the app personality through tomato characters.
5. Keep gamification simple.
6. Build the MVP before adding complex features.

---



# 2. Core Reward Rules

These rules are the source of truth for the reward system.


| Action                              | Reward                                              |
| ----------------------------------- | --------------------------------------------------- |
| 1 hour of focused work              | 10 tomatoes                                         |
| Complete a task                     | Confetti animation                                  |
| Complete everything in today's plan | 1 Golden Tomato                                     |
| Focus on a weekend (Sat/Sun)        | 2x tomatoes                                         |
| Focus on consecutive days           | Streak progress (weekends and holidays are skipped) |




### Tomato conversion

```text
60 minutes = 10 tomatoes
1 tomato = 6 minutes
```

Formula:

```text
tomatoes = floor((focusMinutes / 6) × rewardMultiplier)
```

Tomatoes are always whole numbers. Leftover minutes below the next tomato do not count.

`rewardMultiplier` is `1` on normal days and `2` on weekends (see Weekend bonus below).

Examples (normal day):

```text
6 min   → 1 tomato
15 min  → 2 tomatoes
30 min  → 5 tomatoes
45 min  → 7 tomatoes
60 min  → 10 tomatoes
120 min → 20 tomatoes
```



### Weekend bonus

Focus on a Saturday or Sunday earns **2x tomatoes**.

```text
60 min on a weekday → 10 tomatoes
60 min on a weekend → 20 tomatoes
```

- The multiplier applies to tomatoes only. Focus minutes are never doubled, so total focus time stays accurate.
- It is based on the date the session started, in the user's local time zone.
- It is a bonus for choosing to work, not an expectation. Do not guilt users for resting on weekends.
- Only weekends earn the bonus. Marking a day as a holiday (see Section 8) does not, otherwise the toggle could be used to double rewards every day.
- The Golden Tomato is unaffected. It is still one per day.

Do not make users feel that short sessions are worthless. Progress should be visible continuously.

---



# 3. App Structure

The app has four primary pages:

```text
🏠 Home
✅ Tasks
🌱 Garden
📅 History
```

Navigation:

```text
┌───────────────────────────────────────────────────┐
│  🏠 Home    ✅ Tasks    🌱 Garden    📅 History     │
└───────────────────────────────────────────────────┘
```



### Page responsibilities


| Page    | Main question                    |
| ------- | -------------------------------- |
| Home    | What am I doing today/right now? |
| Tasks   | What do I need to get done?      |
| Garden  | What have I grown?               |
| History | What have I done over time?      |


Do not create a separate "Stats" page in the initial design. Long-term statistics belong inside **Garden**.

---



# 4. Home Page

Home is the primary productivity screen.

## Required sections

1. Timer
2. Today's stats
3. Today's Plan (ordered to-do list, see 4.1)
4. Tomato progress
5. Golden Tomato progress
6. Optional small garden preview

Home shows only Today's Plan, not the full task list. All tasks live on the Tasks page (Section 5).

### Timer

Required controls:

- Start
- Pause
- Resume
- Reset
- End

The duration is set in a dialog while the timer is idle. Tap the time to open it. Scroll hours and minutes (**5 minutes to 6 hours**, in 5-minute steps) or use a preset (5m, 15m, 25m, 45m, 1h, 2h), then tap Done. The default is 25 minutes. The last duration you set is remembered. Duration cannot be changed while a session is running or paused.

Example:

```text
             😄

           25:00   ← tap to open duration dialog

      [ Start ]
```

The timer is the most important interaction on Home.

### Today's stats

Show a concise snapshot in a compact banner above the timer:

```text
🍅 12   ⏱ 1h 15m   ✓ 3/7   🔥 6d
```

Today's stats also contains the **Holiday toggle** (see Section 8) and, on Saturdays and Sundays, a **2× Weekend Bonus** indicator.

Home should show today's information, not overwhelm the user with historical analytics.

---



## 4.1 Today's Plan

Today's Plan is the user's **ordered to-do list for the day**: every actionable item they need to get done today, in the exact sequence they intend to do it.

The goal is a strict, visible order. At a glance the user should know what is done, what is next, and what is left.

Home shows only Today's Plan. The full list of tasks lives on the Tasks page (Section 5), and the user pulls tasks from there into today's plan.

Example:

```text
TODAY'S PLAN                                   2 / 7

  +
✓ 1. 🍳 Breakfast
  +
✓ 2. Reply to emails
  +
☐ 3. Write research report      HIGH      ← UP NEXT
      [ Start Focus ]
  +
☐ 4. 🥪 Lunch
  +
☐ 5. Read paper
  +
☐ 6. 💪 Gym
  +
☐ 7. 🍽️ Dinner
  +

[ + Add item ]
```



### Plan items

Today's Plan contains two kinds of items:


| Kind         | Examples                      | Behavior                                                                                                                                        |
| ------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Routine item | Breakfast, Lunch, Gym, Dinner | Lightweight: a title and a checkbox. No priority, subtasks, or focus timer. No confetti.                                                        |
| Task         | Write report, Read paper      | A task from the Tasks page (Section 5), including priority, deadline, subtasks, and **Start Focus**. Completing it triggers confetti. |


A task in the plan is a reference to a task on the Tasks page. Completing it on either page completes it everywhere.

Plan items have no scheduled times. The order is the schedule.

### Pre-added routine

Every new day's plan starts with a default routine, in this order:

```text
1. 🍳 Breakfast
2. 🥪 Lunch
3. 💪 Gym
4. 🍽️ Dinner
```

- Default items behave like any other plan item. The user can complete, rename, reorder, or delete them (not everyone goes to the gym every day).
- A day's plan is created the first time that day is opened. If the user deletes a default item, it does not come back that day.
- Each day has its own plan. Changing today's plan never changes past days.
- Unfinished items are not carried over automatically. Every day starts fresh. Unfinished tasks stay on the Tasks page and can be added to a later plan.
- Define the default routine in one place (`defaultRoutine.ts`) so it is easy to change later.



### Adding items anywhere

The user can add an item at any position in the plan: before the first item, between any two items, or after the last item.

```text
+   ← before the first item
Breakfast
+   ← between items
Lunch
+   ← after the last item
```

- Show an insertion point (`+`) above the first item, between every pair of items, and below the last item. On desktop these can be subtle and appear on hover or focus.
- Every item also has **Add above** and **Add below** actions in its menu. Hover-only controls are not enough for touch and keyboard users.
- A primary **+ Add item** button appends to the end of the plan.
- A new item takes exactly the position chosen, and the items after it shift down.
- Adding a task offers two choices: **create a new task** (only a title is required) or **pick an existing task** from the Tasks page. Tasks created here also appear on the Tasks page.
- Removing a task from the plan only removes it from today's plan. The task stays on the Tasks page. Deleting a task entirely happens on the Tasks page.



### Strict order

The order is set only by the user.

- Never auto-sort the plan by priority, estimate, completion state, or title. Priority affects visual hierarchy only.
- Completed items stay where they are, shown as checked, so the day still reads as a sequence.
- The first incomplete item is highlighted as **Up next**.
- Completing items out of order is allowed. It never reorders the plan, and **Up next** always points to the first incomplete item.
- Provide **Move up** and **Move down** controls to reorder items. These are also the keyboard-accessible baseline. Drag-and-drop is an optional enhancement; do not add a library just for it in the MVP.



### Completion and Golden Tomato

Completing every item in Today's Plan (tasks and routine items) unlocks that day's Golden Tomato. See Section 7.

Today's stats shows progress through the whole plan, for example `3 / 7 planned`.

### Implementation notes

- Store the plan as `PlanItem` records with a `date` and `order` (see Section 18). Keep `order` contiguous (0 to n−1) within a day and re-index it after every insert, move, or delete.
- Keep ordering logic out of components. Use utilities such as `insertPlanItem()`, `movePlanItem()`, and `getUpNextItem()` in `planUtils.ts`.
- Reuse `TaskItem` for task rows rather than duplicating task UI.

---



# 5. Tasks

Tasks are actionable units of work.

Tasks are managed on the **Tasks page**. It holds every task the user has created. Home shows only the tasks the user has put into Today's Plan (see 4.1).

Tasks page example:

```text
✅ TASKS                                  [ + New Task ]

Write research report
HIGH PRIORITY · Due Fri · In today's plan

Read paper
Due Mon                      [ Add to today's plan ]

Book dentist appointment
                             [ Add to today's plan ]
```

On the Tasks page the user can:

- Create, edit, and delete tasks
- Set priority, deadline, and subtasks
- Complete tasks
- Add a task to today's plan (it is appended to the end; the user can reorder it on Home)
- See which tasks are already in today's plan
- View completed tasks

Sorting and filtering (for example by deadline or priority) are fine on the Tasks page. Only Today's Plan has a strict, user-defined order.

A task may have:

- Title
- Description (optional)
- Deadline (optional)
- Priority
- Completion state
- Subtasks
- Created and completed dates (recorded automatically, never entered by the user)

Example:

```text
Write research report
HIGH          2/4

✓ Research
✓ Create outline
☐ Write introduction
☐ Write conclusion
```



## Priority

Initial priority levels:

```text
HIGH
MEDIUM
LOW
```

Priority affects visual hierarchy only. It does not change tomato rewards.

Subtask progress (`2/4`) sits beside or under the priority badge.

## Deadline

Users can optionally set a deadline for a task.

- A deadline is a date only. Tasks have no start times, due times, or scheduled times of day.
- Deadlines are optional and never required to create a task.
- Show the deadline as a label on the task (for example `Due Fri`). Tasks past their deadline may get subtle visual emphasis.
- A deadline never changes tomato rewards or the order of Today's Plan, and missing one has no penalty.



## Subtasks

Subtasks belong to a parent task.

Example:

```text
Write report

✓ Research
✓ Create outline
☐ Write introduction
☐ Write conclusion
☐ Proofread
```

Completing subtasks should update the parent task's progress.

---



# 6. Task Completion

Every completed task should trigger a **confetti animation**.

The task itself does not need to award additional tomatoes.

Routine items in Today's Plan (meals, gym) are not tasks for this purpose. They get a simple checked state without confetti, so celebrations stay meaningful.

The intended economy is:

```text
FOCUS → earns tomatoes
TASK COMPLETION → earns celebration
COMPLETE TODAY'S PLAN → earns Golden Tomato
```

This prevents users from creating many tiny tasks just to farm rewards.

---



# 7. Golden Tomato

A Golden Tomato is a special daily reward.

## Unlock condition

The user must complete **everything in that day's plan**: every task and routine item in Today's Plan (see 4.1).

Example:

```text
TODAY'S PLAN

✓ Finish report
✓ Read paper
✓ Reply to emails
✓ Workout

        ↓

   🌟 GOLDEN TOMATO
```

When unlocked:

1. Trigger a celebration.
2. Show the Golden Tomato.
3. Save the reward to the user's history/collection.
4. Mark the day as having earned a Golden Tomato.

Edge cases:

- The plan must contain at least one item.
- A Golden Tomato is awarded once per day.
- Adding items after it has been earned does not revoke it.

Golden Tomatoes should remain special and should not be awarded for ordinary focus sessions.

---



# 8. Streaks

A streak represents consecutive days with meaningful focus activity. Weekends and holidays can be skipped without breaking it (see below).

A day counts toward the streak when the user completes at least one meaningful focus session.

Do not require a full hour to preserve a streak.

Track:

- Current streak
- Longest streak

Example:

```text
Mon   Tue   Wed   Thu   Fri   Sat   Sun
 🍅    🍅    🍅    🍅    🍅    —     —

          🔥 5 DAY STREAK
```

Saturday and Sunday are skipped automatically, so resting on the weekend does not break the streak.

### Weekends and holidays

Saturdays, Sundays, and days marked as holidays are **exempt days**.


| Day type                          | No focus                                                  | Focus                    |
| --------------------------------- | --------------------------------------------------------- | ------------------------ |
| Normal day                        | Breaks the streak                                         | Counts toward the streak |
| Exempt day (Sat, Sun, or holiday) | Skipped: does not break the streak and does not add to it | Counts toward the streak |


Focus on a weekend also earns the 2x tomato bonus (see Section 2).

### Holiday toggle

Users can pause their streak on a holiday by turning on the **Holiday toggle** on Home.

- The toggle applies to the current day. Turning it on makes today an exempt day.
- It can be turned off again the same day.
- It cannot be changed for past days, so the streak cannot be edited after the fact.
- Focusing on a holiday still counts toward the streak, but it does not earn the weekend bonus.
- Holiday days are persisted so streak calculations and History can read them. History marks them with 🏖️.

Streak calculations should be centralized in one utility/module so that Home, Garden, and History all use the same logic. That includes the weekend and holiday rules. Use `isStreakExemptDay(date)` rather than re-implementing them in a page.

---



# 9. Tomato Assets

The project includes tomato emotion assets.

## Standard

`icon.png`

Use this as the standard/default tomato.

## Emotion assets

- `smiling`
- `sleepy`
- `joyous`
- `energised`
- `crying`
- `angry`



## Tomato component

`tomato.svg`

Use this as a reusable tomato visual/component where appropriate, especially for:

- Tomato counters
- Garden displays
- Calendar history
- Streaks
- Progress indicators
- Decorative tomato UI

Do not duplicate tomato rendering logic across pages. Prefer a reusable `Tomato` component.

---



# 10. Tomato Emotions

Tomato emotions should communicate application state.

Suggested mapping:


| Situation                  | Emotion             |
| -------------------------- | ------------------- |
| Default/normal             | Standard `icon.png` |
| Starting focus             | Smiling             |
| Strong/long focus          | Energised           |
| Focus session completed    | Joyous              |
| User is idle               | Sleepy              |
| User abandons a session    | Crying              |
| Repeatedly resets/abandons | Angry               |


These are recommendations for the initial implementation. Keep the emotion system simple and deterministic.

Do not randomly change emotions without a reason.

---



# 11. Garden Page

Garden replaces a traditional "Stats" page.

The Garden represents the user's accumulated productivity.

The page should feel **visual first, analytical second**.

## Sections

1. My Garden
2. Milestones
3. Streaks
4. Garden statistics
5. Tomato collection

---



## 11.1 My Garden

The top of Garden should visually represent accumulated tomatoes.

Example:

```text
             🍅 MY GARDEN

          127 TOMATOES

       🍅 🍅 🍅 🍅
     🍅 🍅 🍅 🍅 🍅
   🍅 🍅 🍅 🍅 🍅 🍅

          12h 42m
        focused time
```

The garden can become more visually elaborate later.

For MVP, a simple tomato collection/grid is enough.

---



## 11.2 Garden Statistics

Group statistics by concept instead of presenting a generic analytics dashboard.

### Harvest

- Total tomatoes
- Tomatoes this week
- Tomatoes this month



### Growth

- Total focus time
- Average focus session
- Total focus sessions
- Tasks completed



### Streaks

- Current streak
- Longest streak

Example:

```text
GARDEN STATS

🍅 Total Tomatoes
127

⏱ Total Focus
12h 42m

🎯 Tasks Completed
43

🔥 Current Streak
6 days

🏆 Longest Streak
14 days
```

---



# 12. Milestones

Milestones recognize cumulative progress.

Initial examples:


| Milestone          | Requirement    |
| ------------------ | -------------- |
| 🌱 First Harvest   | 10 tomatoes    |
| 🍅 Getting Started | 50 tomatoes    |
| 🌿 Growing Strong  | 100 tomatoes   |
| 🌳 Flourishing     | 500 tomatoes   |
| 🍅 Tomato Master   | 1,000 tomatoes |


Milestones can later include:

- Total focus time
- Focus sessions
- Completed tasks
- Consecutive days
- Golden Tomatoes earned

A milestone should expose:

- Name
- Description
- Requirement
- Current progress
- Completion state

---



# 13. Tomato Collection

Garden may contain a collection of tomato types.

### Standard

🍅 Standard Tomato

### Emotions

- 😊 Smiling
- ⚡ Energised
- 😴 Sleepy
- 🥳 Joyous
- 😢 Crying
- 😠 Angry



### Special

- 🌟 Golden Tomato

Future versions may add seasonal or event tomatoes.

Do not build a large collectible economy in MVP.

---



# 14. History Page

History is the user's productivity journal.

The primary UI should be a calendar.

Example:

```text
          SEPTEMBER 2026

     M   T   W   T   F   S   S

     1   2   3   4   5   6   7
    🍅  🍅      🍅🍅  🍅

     8   9  10  11  12  13  14
   🍅🍅  🍅  🍅🍅🍅    🍅

    15  16  17  18  19  20  21
    🍅  🍅🍅🍅  🌟  🍅🍅      🍅
```

The number of tomatoes should communicate the relative amount of focus for each day.

Clicking a day opens that day's details.

---



# 15. Daily History Details

A selected day should show:

- Date
- Tomatoes collected
- Golden Tomato status
- Total focus time
- Tasks completed
- Focus sessions

Example:

```text
SEPTEMBER 18

🌟 Golden Tomato
🍅 20 tomatoes

⏱ Focus
2h 04m

✓ Tasks
4 completed

FOCUS SESSIONS

9:00 AM    25m
10:15 AM   50m
2:30 PM    49m
```

---



# 16. Focus Sessions

A focus session records actual focused time.

Suggested data:

```text
FocusSession
├── id
├── taskId
├── startedAt
├── endedAt
├── durationMinutes
└── completed
```

A focus session should be associated with a task when the user starts the timer from a task.

The timer should also support a general focus session if no task is selected.

---



# 17. Daily Progress

Daily progress is useful for History, streaks, Golden Tomatoes, and Garden.

Suggested data:

```text
DailyProgress
├── date
├── focusMinutes
├── tomatoes
├── tasksCompleted
├── tasksTotal
├── planItemsCompleted
├── planItemsTotal
├── goldenTomato
├── holiday
└── streak
```

`tasksCompleted` and `tasksTotal` count only tasks. `planItemsCompleted` and `planItemsTotal` count everything in Today's Plan, including routine items. `holiday` is set by the user with the Holiday toggle (see Section 8).

Prefer deriving values from underlying sessions/tasks where practical rather than maintaining many independent sources of truth.

For example, total daily focus should ideally be calculated from focus sessions rather than manually incremented in multiple places.

---



# 18. Data Model



## Task

```text
Task
├── id
├── title
├── description?
├── priority
├── deadline?
├── completed
├── subtasks[]
├── createdAt
└── completedAt?
```

`deadline` is an optional date with no time of day. `createdAt` and `completedAt` are recorded automatically so History can group tasks by day. Users never enter or see times for tasks.

## Subtask

```text
Subtask
├── id
├── taskId
├── title
├── completed
└── completedAt?
```



## PlanItem

```text
PlanItem
├── id
├── date
├── order
├── kind ("task" | "routine")
├── taskId?        (task items)
├── title?         (routine items)
└── completed?     (routine items)
```

A `PlanItem` places something in a specific day's Today's Plan (see 4.1). `order` is its position within that date.

Task items point to a `Task` and do not store their own completion. Completion always comes from the `Task`, so there is one source of truth. Routine items (Breakfast, Lunch, Gym, Dinner) exist only as plan items and never appear on the Tasks page.

## FocusSession

```text
FocusSession
├── id
├── taskId?
├── startedAt
├── endedAt
├── durationMinutes
└── completed
```



## DailyProgress

```text
DailyProgress
├── date
├── focusMinutes
├── tomatoes
├── tasksCompleted
├── tasksTotal
├── planItemsCompleted
├── planItemsTotal
├── goldenTomato
└── holiday
```



## Milestone

```text
Milestone
├── id
├── name
├── description
├── requirement
├── progress
└── completed
```

---



# 19. Architecture Guidelines

The project should separate:

```text
UI
↓
Hooks / state
↓
Business logic
↓
Persistence
```

Do not put tomato calculations, streak calculations, and reward logic directly inside large React components.

Prefer utilities/services such as:

```text
tomatoCalculations.ts
streakCalculations.ts
rewardService.ts
dateUtils.ts
```

This makes the reward system easier to test and change.

---



# 20. Suggested React Project Structure

Use a structure similar to:

```text
src/
│
├── components/
│   ├── timer/
│   │   ├── Timer.tsx
│   │   ├── TimerDisplay.tsx
│   │   └── TimerControls.tsx
│   │
│   ├── tomato/
│   │   ├── Tomato.tsx
│   │   ├── TomatoCounter.tsx
│   │   ├── TomatoGarden.tsx
│   │   └── TomatoEmotion.tsx
│   │
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskForm.tsx
│   │   └── SubtaskList.tsx
│   │
│   ├── plan/
│   │   ├── TodayPlan.tsx
│   │   ├── PlanItem.tsx
│   │   └── PlanInsertPoint.tsx
│   │
│   ├── rewards/
│   │   ├── GoldenTomato.tsx
│   │   ├── Milestone.tsx
│   │   └── Confetti.tsx
│   │
│   └── common/
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── ProgressBar.tsx
│
├── pages/
│   ├── Home.tsx
│   ├── Tasks.tsx
│   ├── Garden.tsx
│   └── History.tsx
│
├── assets/
│   ├── icon.png
│   ├── smiling.*
│   ├── sleepy.*
│   ├── joyous.*
│   ├── energised.*
│   ├── crying.*
│   ├── angry.*
│   └── tomato.svg
│
├── hooks/
│   ├── useTimer.ts
│   ├── useTasks.ts
│   ├── useTodayPlan.ts
│   └── useTomatoes.ts
│
├── utils/
│   ├── tomatoCalculations.ts
│   ├── streakCalculations.ts
│   ├── rewardService.ts
│   ├── planUtils.ts
│   ├── defaultRoutine.ts
│   └── dateUtils.ts
│
├── types/
│   ├── task.ts
│   ├── plan.ts
│   ├── focusSession.ts
│   ├── tomato.ts
│   └── milestone.ts
│
└── App.tsx
```

The exact structure can change if the existing project has a different convention. Preserve the project's established conventions rather than restructuring unnecessarily.

---



# 21. Recommended Stack

The intended frontend stack is:

```text
React
TypeScript
Vite
Tailwind CSS
```

Potential future architecture:

```text
React + TypeScript
        ↓
      API
        ↓
    Database
```

For the first version, local persistence can be used if a backend is not yet required.

Do not add a backend solely because it might be useful later.

---



# 22. State Management

Keep state ownership close to where it is used.

Likely application-level state:

- Current timer state
- Tasks
- Today's Plan
- Focus sessions
- Tomato totals
- Streak
- Garden data

Avoid introducing a large state-management library until the application actually needs one.

React state/hooks are sufficient for an initial MVP unless the existing project already uses another approach.

---



# 23. Persistence

MVP may use browser persistence such as `localStorage`.

Persist at minimum:

- Tasks
- Subtasks
- Today's Plan (plan items and their order)
- Focus sessions
- Tomato progress
- Golden Tomato history
- Streak information
- Holiday days
- Milestone progress

The persistence layer should be abstracted enough that a backend can replace it later.

For example:

```text
UI
 ↓
useTasks()
 ↓
taskRepository
 ↓
localStorage
```

Later:

```text
UI
 ↓
useTasks()
 ↓
taskRepository
 ↓
API
 ↓
Database
```

---



# 24. Timer Requirements

The timer must not rely solely on repeated UI renders to determine elapsed time.

Use timestamps to calculate elapsed duration.

Conceptually:

```text
elapsed =
currentTime - sessionStartedAt
```

This prevents timer drift caused by rendering delays or browser throttling.

When paused, record the accumulated focus time and the pause state.

When resumed, start a new timing interval or update the timing state without counting paused time.

When a session ends, persist the final duration.

---



# 25. Reward Calculation

Reward calculations should be deterministic.

For focus minutes:

```text
tomatoes = floor((focusMinutes / 6) × rewardMultiplier)
```

Do not duplicate this formula in multiple components.

Use one centralized function:

```text
calculateTomatoes(focusMinutes, sessionDate)
```

Similarly, use centralized functions for:

```text
calculateCurrentStreak()
checkGoldenTomatoEligibility()
getMilestoneProgress()
getRewardMultiplier(date)
isStreakExemptDay(date)
```

`calculateTomatoes` should apply the weekend multiplier by calling `getRewardMultiplier(date)`, so no component multiplies tomatoes itself.

---



# 26. Animation Guidelines

Animations should provide feedback, not slow the user down.

### Task completed

```text
Checkbox
   ↓
Confetti
   ↓
Completed state
```



### Focus session completed

```text
Timer ends
   ↓
Joyous tomato
   ↓
Tomato reward animation
```



### Golden Tomato

```text
All tasks completed
   ↓
Confetti
   ↓
Golden Tomato animation
   ↓
Saved to history
```

Animations should be short and dismissible where appropriate.

Respect reduced-motion accessibility preferences.

---



# 27. Empty States

Every page should have a useful empty state.

## Home — no tasks

```text
🍅

Nothing planned yet.

Add a task and start growing your garden.

[ + Add Task ]
```

Because Today's Plan is pre-filled with routine items, this state usually appears as a nudge inside the plan (for example, under the routine items) rather than as a full-page state. Show the full version only if the plan has no items at all.

## Tasks — no tasks

```text
✅

No tasks yet.

Create a task, then add it
to today's plan.

[ + New Task ]
```



## Garden — no tomatoes

```text
🌱

Your garden is empty.

Complete your first focus session
to grow your first tomatoes.
```



## History — no history

```text
📅

No focus history yet.

Start a session to grow your first tomatoes.
```

---



# 28. Important UX Rules



### Do

- Make the timer immediately accessible.
- Show reward feedback after focus.
- Make task completion satisfying.
- Keep Today's Plan in exactly the order the user set.
- Let users rest on weekends and holidays without losing their streak.
- Make tomato progress visible.
- Keep Garden visually engaging.
- Keep History easy to understand.
- Make short focus sessions feel meaningful.



### Avoid

- Excessive animations.
- Too many currencies.
- Complicated reward rules.
- Leaderboards in MVP.
- Social features in MVP.
- Punishing users for missing a day.
- Making the user interact with gamification after every tiny action.

---



# 29. MVP Development Roadmap



## Phase 1 — Foundation

- [x] React/TypeScript/Vite setup
- [x] Tailwind setup
- [x] App routing/navigation
- [x] Home page
- [x] Tasks page
- [x] Garden page
- [x] History page
- [x] Import tomato assets



## Phase 2 — Timer

- [x] Timer display
- [x] Start
- [x] Pause
- [x] Resume
- [x] Reset
- [x] End
- [x] Focus session persistence



## Phase 3 — Tasks

- [x] Create task
- [x] Edit task
- [x] Delete task
- [x] Complete task
- [x] Priority
- [x] Deadline (optional)
- [x] Subtasks



## Phase 4 — Today's Plan

- [x] Ordered plan list on Home
- [x] Default routine (Breakfast, Lunch, Gym, Dinner)
- [x] Add tasks to the plan (create new or pick existing)
- [x] Insert items before, between, and after existing items
- [x] Add above / Add below item actions
- [x] Reorder items (move up / move down)
- [x] Edit and delete items, including defaults
- [x] Complete items in place (order preserved)
- [x] Up next highlight
- [x] Per-day plan persistence



## Phase 5 — Rewards

- [x] Tomato calculation
- [x] Tomato counter
- [x] Tomato garden
- [x] Emotion states
- [x] Confetti
- [x] Golden Tomato
- [x] Streak (weekends skipped)
- [x] Holiday toggle
- [x] Weekend 2x bonus



## Phase 6 — Garden

- [x] Total tomatoes
- [x] Garden visualization
- [x] Milestones
- [x] Garden statistics
- [x] Tomato collection



## Phase 7 — History

- [ ] Calendar
- [ ] Tomatoes per day
- [ ] Day detail
- [ ] Focus session history
- [ ] Task history



## Phase 8 — Polish

- [ ] Responsive design
- [ ] Accessibility
- [ ] Reduced motion
- [ ] Empty states
- [ ] Error states
- [ ] Loading states
- [ ] Persistence testing
- [ ] Mobile UI
- [ ] Performance improvements

---



# 30. Future Features

Do not implement these unless explicitly requested.

Potential future additions:

- Short/long breaks
- Notification sounds
- Browser notifications
- Advanced analytics
- Estimated vs actual task time
- Customizable default routine (edit, reorder, or set specific weekdays)
- Automatically carry over unfinished plan items to the next day
- Mark holidays in advance (multiple days or date ranges)
- Configurable weekend days
- Most productive time of day
- Seasonal tomatoes
- Rare tomatoes
- Garden environments
- Tomato customization
- Cloud synchronization
- User accounts
- Mobile app
- Social features
- Leaderboards

The core experience should remain useful without these.

---



# 31. Copilot Development Rules

When modifying this project, follow these rules.

### Rule 1 — Read this README first

Before implementing a new feature, use this README as the product-level source of truth.

### Rule 2 — Preserve existing functionality

Do not rewrite working components unnecessarily.

### Rule 3 — Reuse components

If a UI pattern already exists, reuse or extend it rather than creating a duplicate.

### Rule 4 — Centralize business logic

Do not put reward calculations directly inside UI components.

### Rule 5 — Keep types explicit

Use TypeScript types/interfaces for:

- Tasks
- Subtasks
- Focus sessions
- Daily progress
- Milestones
- Tomato states

Avoid `any` unless there is a clear reason.

### Rule 6 — Do not over-engineer

Prefer the simplest implementation that satisfies the requirement.

Do not introduce:

- New libraries
- New architecture
- Backend infrastructure
- Global state libraries

unless the feature actually requires them.

### Rule 7 — Keep the tomato system consistent

The source-of-truth reward rule is:

```text
60 focus minutes = 10 tomatoes
(20 tomatoes on a Saturday or Sunday)
```

Do not invent alternative tomato rewards without updating this README.

### Rule 8 — Tasks do not automatically award tomatoes

Tomatoes come from focused time.

Task completion triggers celebration.

Completing everything in Today's Plan unlocks the Golden Tomato.

### Rule 9 — Garden is the stats destination

Do not create a separate Stats page unless the product requirements change.

### Rule 10 — Mobile-friendly UI

The application should work well on desktop and mobile-sized screens.

### Rule 11 — Accessibility

Use:

- Semantic HTML
- Keyboard-accessible controls
- Visible focus states
- Accessible labels
- Appropriate ARIA only where needed
- Reduced-motion support



### Rule 12 — Update this README when product rules change

If a product requirement changes, update the relevant section of this README so future development stays consistent.

---



# 32. Definition of Done

A feature is not considered complete merely because it works technically.

Before considering a feature complete, verify:

- [ ] TypeScript has no new errors.
- [ ] Existing functionality still works.
- [ ] UI works on desktop.
- [ ] UI works on mobile-sized screens.
- [ ] Buttons/controls are keyboard accessible.
- [ ] Loading/empty states are handled where relevant.
- [ ] Animations do not block interaction.
- [ ] Data persists when persistence is required.
- [ ] Business logic is not duplicated.
- [ ] The implementation follows the reward rules in this README.

---



# 🍅 Core Product Loop

Everything in Pomodoro should ultimately support this loop:

```text
┌───────────────┐
│   CREATE TASK │
└───────┬───────┘
        ↓
┌───────────────┐
│  START FOCUS  │
└───────┬───────┘
        ↓
┌───────────────┐
│     FOCUS     │
└───────┬───────┘
        ↓
┌───────────────┐
│ GROW TOMATOES │
└───────┬───────┘
        ↓
┌───────────────┐
│ COMPLETE TASK │
└───────┬───────┘
        ↓
      🎉
    CONFETTI
        ↓
┌───────────────┐
│  MORE FOCUS   │
└───────┬───────┘
        ↓
┌───────────────┐
│ GOLDEN TOMATO │
│  IF ALL DONE  │
└───────┬───────┘
        ↓
┌───────────────┐
│    GARDEN     │
└───────────────┘
```



## The central idea

> **You don't earn points. You grow tomatoes. 🍅**

Every feature should reinforce that idea without making the app itself distracting.