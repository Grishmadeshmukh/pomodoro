# Decisions and business logic

This file records the rules the app follows today. `README.md` is the original product sketch. Where they differ, this file matches the code.

The app is a local-first Pomodoro timer. Focus time becomes tomatoes, a finished day can earn one golden tomato, and hours of focus grow a garden. Google sign-in can keep one copy of that data on the account. The screen still reads and writes `localStorage`.

## Pages

| Page | Decision |
| --- | --- |
| Home | The live timer, today's plan, today's tomatoes, and the golden-tomato card. |
| Tasks | The task list. Dragging reorders. A task can be added to today's plan from here. |
| Garden | Lifetime focus, harvest totals, streaks, and tomato milestones. |
| History | A Monday-start calendar of focus, holidays, and settled golden tomatoes. |
| About | How the timer, tomatoes, plan, and garden work. The title opens and closes it. |

There is no separate stats page. Long-term numbers live on Garden.

## Time

Dates are local calendar days, stored as `YYYY-MM-DD`. A session belongs to the day it started, not the day it ended.

The week starts on Monday. History's calendar does too. "This week" on Garden is Monday through today.

A deadline is a date with no time. It is overdue when that date is before today. The label is the weekday, such as "Due Fri".

## Timer

The default focus length is 25 minutes. The picker allows 5 minutes through 6 hours, in 5-minute steps. A chosen length is remembered on this device and can be changed only while the timer is idle.

The timer has three states: idle, running, and paused. Elapsed time is the sum of finished segments plus the current running segment, and it never passes the chosen length. A refresh keeps a running or paused timer. Idle does not leave a timer record behind.

A focus session is stored when it lasts at least one second:

| How it stops | Session stored | Counts as an abandon |
| --- | --- | --- |
| The timer reaches the chosen length | Yes, marked completed | No |
| End early | Yes, marked not completed | Yes |
| Reset after at least one second | No | Yes |
| Reset before one second | No | No |

Partial sessions still earn tomatoes for the minutes that were focused. Tomatoes are calculated from the session's start time, so a session that crosses midnight keeps the multiplier of the day it started.

The running timer is not replaced when account data is synced. Only the abandon count is part of the synced record.

Breaks are not a separate mode. Every stored session is a focus session.

## Tomatoes

```text
tomatoes = floor((focusMinutes / 6) × multiplier)
```

One tomato is 6 minutes. Leftover minutes are dropped. Zero or negative minutes earn nothing.

| Day the session started | Multiplier |
| --- | --- |
| Monday–Friday | 1 |
| Saturday or Sunday | 2 |

The multiplier changes tomatoes only. Focus minutes stay the real minutes, so total focus time and the garden do not double on weekends.

A holiday does not change the multiplier. The holiday toggle cannot be used to double rewards.

The count shown on Home adds tomatoes already stored today to the tomatoes of the timer that is running or paused. Those live tomatoes are not stored until the session ends.

## Garden

The garden grows from focus minutes, not from the tomato count.

```text
completed hours = floor(focusMinutes / 60)
```

Hours 1 through 6 are stages of one plant, from sapling to mature tree. Hour 7 keeps that tree and starts a new sapling. Every finished tree stays. The live garden shows every hour. The About-page preview is a separate illustration and stops at 180 hours.

Harvest on Garden:

| Basket | What it counts |
| --- | --- |
| Golden tomatoes | Settled golden-tomato days |
| This week's tomatoes | Tomatoes from sessions since Monday |
| Total tomatoes | Tomatoes stored on every session |

Milestones are lifetime tomato totals: 10, 50, 100, 500, and 1,000. Progress is that total divided by the goal, capped at done.

## Tasks

A task has a title, optional description, priority (low, medium, or high), optional deadline, subtasks, and an order.

Open tasks are listed before completed ones. Inside each group, lower `order` comes first. A new task is placed at the front of its group. Completing a task moves it to the front of the completed group. Uncompleting moves it to the front of the open group.

A task with an unfinished subtask cannot be marked complete. If a subtask is reopened on a completed task, the task becomes open again. Its `completedAt` is kept, so the 24-hour deletion below still runs.

A task is deleted 24 hours after `completedAt`. That also removes its rows from every day's plan. Deleting a task by hand does the same. Taking a row off today's plan does not delete the task.

Subtask completion is its own flag. Checking a subtask does not complete the parent. The parent can be completed only when every subtask is done.

## Today's plan

The plan is stored per date. Today is the local date. Other days are left as they were stored.

A row is either a task or a routine.

| Row | What it points at |
| --- | --- |
| Whole task | A task in the task list. The title and completion shown are the task's. |
| Subtask | One subtask. Completion follows that subtask. |
| Plan-only task | A title that exists only on that day's plan. |
| Routine | A preset or a saved routine. Completion lives on the plan row. |

Checking a linked task or subtask updates the task and copies that completion onto today's matching rows. Other days are not rewritten.

The first unfinished row is "up next".

Adding a row inserts it at a chosen index and renumbers the day. Order is the row index after that.

Removing a row asks for confirmation and removes it from today's plan only.

### Routines

Permanent presets are Lunch and Dinner. Addable presets are Gym and Work. A custom routine gets its own id. Its icon is inferred from the title: meals, gym, or work, when the title matches those words.

Lunch and Dinner stay in the add dialog. They are not copied into the saved-routine list. Gym, Work, and custom routines are saved when added, so they can be added again later. Renaming a saved routine on the plan updates that saved routine. Renaming Lunch or Dinner does not.

An older build kept routine rows inside today's plan. Those rows are moved out once, back into the add dialog, and the plan keeps the non-routine rows. That one-time flag stays on the device.

## Golden tomato

The golden tomato is one per day. The weekend multiplier does not change it.

Today's card is live. It is earned when today's plan has at least one row and every row is done. An empty plan does not earn it. Unchecking a row takes it away immediately. Finishing the last row plays a short celebration. That live state is not written into the daily flags yet, so an accidental check can still be undone.

When the local day ends, each past plan is settled once:

- If that day's stored plan was non-empty and every row was complete, the day keeps a golden tomato.
- Otherwise it does not.
- The result is locked. Later edits do not reopen it.

A golden flag that was saved for today before the day finished, and was not yet locked, is cleared. History and the golden harvest count only locked days.

Settlement runs when the app opens, when the tab becomes visible or focused, and at the next local midnight.

## Holidays and streaks

Any day can be marked a holiday from History. A holiday is a rest day for the streak. It does not grant weekend tomato bonus.

A day counts as focused when some stored session that started that day lasted at least one minute.

The current streak walks backward from the latest relevant day:

- If today already has focus, start at today. Otherwise start at yesterday, so an unfinished today does not break the streak.
- A focused day adds one.
- A weekend or holiday is skipped. It neither adds nor breaks.
- Any other day with no focus breaks the streak.

The walk stops after 400 days. The longest streak is the best run in that same history, and it is at least as long as the current streak.

## History

Sessions are grouped by the day they started, newest day first. Today and yesterday are labeled. Older days use their date key.

The calendar marks days that have focus, days marked as holidays, and days with a settled golden tomato.

## The tomato character

The character on Home follows the timer. These holds are short on purpose.

| Situation | Character |
| --- | --- |
| Running, under 25 minutes | Focusing |
| Running, 25 minutes or more | Energised |
| Paused | Focusing |
| A completed session, for 3.5 seconds | Joyous |
| An abandoned session, for 3.5 seconds | Crying |
| The third abandon of that calendar day, for those same 3.5 seconds | Angry |
| Idle for 20 seconds | Sleepy |
| Otherwise | Idle |

The abandon count used for the angry face is the synced daily counter. It starts over on the next local date.

## What is stored where

`localStorage` is the live store. Repositories read and write it synchronously. The screen does not wait on the network.

| Key | What it holds | Account sync |
| --- | --- | --- |
| `pomodoro.v1.tasks` | Task list | Yes, one revision per task id |
| `pomodoro.v2.planItems` | Plan rows keyed by date | Yes, one revision per date, not per row |
| `pomodoro.v1.savedRoutines` | Saved routines | Yes, one revision per routine key |
| `pomodoro.v1.dailyFlags` | Holiday and golden-tomato flags | Yes, one revision per date |
| `pomodoro.v1.abandonCount` | The current `{ date, count }` | Yes, one revision for that date |
| `pomodoro.v1.focusSessions` | Focus sessions | Yes, one revision per session id |
| `pomodoro.v1.syncMeta` | Account link, revisions, tombstones, dirty flag | Local bookkeeping for sync |
| `pomodoro.v1.activeTimer` | Running or paused timer | This device only |
| `pomodoro.v1.preferredDurationMs` | Chosen focus length | This device only |
| `pomodoro.v2.routinesStayInPicker` | The one-time routine migration | This device only |

Domain types do not carry revision fields. Revisions and deletions live only in sync meta.

Sync meta, at `pomodoro.v1.syncMeta`, holds:

| Field | Meaning |
| --- | --- |
| `userId` | The account this browser is linked to, or null |
| `revisions` | Last local write time for each id, split by collection |
| `tombstones` | Ids removed locally, with the time of deletion, split by collection |
| `dirty` | A push is owed |
| `lastRemoteUpdatedAt` | The remote `updated_at` last applied |

Collections are split so a plan date, a daily-flag date, and an abandon date can share the same day without overwriting each other.

On a save of a synced key, the previous JSON is compared with the next JSON. An added or changed id gets `new Date().toISOString()`. A removed id becomes a tombstone and loses its revision. Putting that id back clears the tombstone and sets a new revision. An unchanged id keeps its old time. If nothing changed, `dirty` is left as it was.

While a remote snapshot is being written back, `setHydrating(true)` makes those saves skip revision tracking. Otherwise a pull would look like a local edit.

## Sign-in

Sign-in exists only when both Supabase env vars are set. Without them the app is local only and shows no account control.

Sign-in uses Google through Supabase and returns to this site's origin. It does not block Home, Tasks, Garden, or History. The header shows the Google name, then the email. Sign-out leaves local data in place and cancels a push that has not started.

The signed-in copy is one `user_state` row per user. The user can read and write only their own row. The row stores the six synced collections, tombstones, and `updated_at`. It does not store per-item revisions. Those stay in sync meta on each browser. During a merge, every item in the remote snapshot is treated as revised at that row's `updated_at`.

`AuthProvider` starts the sync when a session exists. It loads that user's row and follows one of four cases:

1. **No linked account and no remote row.** The current tasks, plan, routines, flags, abandon count, and sessions are inserted, `userId` is set, and `dirty` is cleared.
2. **No linked account and a remote row exists.** The two sides are merged and written back to `localStorage`, then `userId` is set.
3. **The linked account is this session.** The two sides are merged. If this account has no row yet, the local data stays and `dirty` remains set so a later push can create the row.
4. **The linked account is someone else.** Local synced data is replaced with that account's row. The previous account's data is not uploaded. If that account has no row yet, the synced collections are cleared.

Device-only keys are left alone in every case.

### Merge

Each collection is merged on its own.

- The same id or date keeps the side with the newer revision. If the times are equal, the remote copy is kept.
- The same content is not a conflict, even if object keys come back in a different order.
- A tombstone newer than the other side's revision drops that id. An older tombstone does not.
- An id that exists on only one side is kept, unless a newer tombstone says it was deleted.
- The abandon counter is a single `{ date, count }`. If two dates both survive, the newer one is stored and the other date is tombstoned.

If the merged result differs from the remote row, `dirty` stays set so a later push can upload the local-only pieces. If it matches, `dirty` is cleared.

After a merge or a replacement is written into `localStorage`, the page dispatches `pomodoro:data-synced`.

A failed sign-in request leaves local data and the previous link unchanged. The next local save, and the window regaining focus, try that sign-in sync again.

### Later saves

With a session in place, a local save of a synced collection sets `dirty` and schedules a push. The push waits about 500ms after the latest save, then upserts the six collections and tombstones with `user_id` and a new `updated_at`. `localStorage` is already updated before that request starts, and the screen does not wait for it.

If the upload succeeds and nothing changed while it was in flight, `dirty` is cleared and `lastRemoteUpdatedAt` becomes the row's `updated_at`. A save that landed during the upload keeps `dirty` set, and another push is scheduled.

If the upload fails, `dirty` stays set and the header shows "Not synced". The next local save, and the window regaining focus, try the upload again.

### Screens after a pull

Open screens re-read when `pomodoro:data-synced` fires:

| View | What it re-reads |
| --- | --- |
| Tasks | The task list |
| Today's plan | Today's plan |
| Daily progress | Flags, holidays, and golden dates |
| Focus sessions | The session list |
| Timer | The abandon count for today |
| Add-to-plan dialog | Saved routines |

Golden-tomato settlement reads the repositories when it runs, so a hydrated flag is visible the next time settlement runs. It does not listen for the sync event.
