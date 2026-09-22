import { useState } from 'react'
import { ForestScene } from '../components/Tomato/ForestScene'
import { GardenHoursPreview } from '../components/Tomato/GardenHoursPreview'
import { Tomato } from '../components/Tomato/Tomato'

const GROWTH_IMAGE = encodeURI('/hourly growth.png')
const EXAMPLE_START_HOURS = 3

const COLLECTION = [
  { variant: 'default' as const, name: 'Standard', note: '1 per 6 minutes of focus. Doubled on weekends.' },
  { variant: 'golden' as const, name: 'Golden', note: 'Saved to History when the day ends with every plan item still done.' },
  { variant: 'smiling' as const, name: 'Smiling', note: 'Timer is running.' },
  { variant: 'energised' as const, name: 'Energised', note: 'You’ve been focusing for 25 minutes or more.' },
  { variant: 'sleepy' as const, name: 'Sleepy', note: 'Idle for a while, or on a break.' },
  { variant: 'joyous' as const, name: 'Joyous', note: 'A session just finished.' },
  { variant: 'crying' as const, name: 'Crying', note: 'A session was reset or ended early.' },
  { variant: 'angry' as const, name: 'Angry', note: 'Several sessions in a row were abandoned.' },
]

export function AboutPage() {
  const [previewHours, setPreviewHours] = useState(EXAMPLE_START_HOURS)
  const hours = previewHours

  return (
    <div className="flex flex-col gap-8 pb-4">
      <div>
        <h2 className="text-xl font-semibold text-text">About</h2>
      </div>

      <section className="rounded-2xl bg-white px-5 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-text">
          A brief history of the Pomodoro timer
        </h3>
        <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-text">
          <p>
            In the late 1980s, university student Francesco Cirillo wanted a
            simpler way to focus. He used a tomato kitchen timer namely
            <em> pomodoro</em> (Italian for tomato) which worked in short,
            undistracted bursts.
          </p>
          <p>
            The classic method is still the one most people know: focus for{' '}
            <strong>25 minutes</strong>, take a <strong>5-minute break</strong>,
            and after four of those cycles take a longer rest. Each interval is
            one “pomodoro.”
          </p>
          <p>
            The idea behind it is not the tomato. It is committing to one
            stretch of work, then actually stopping. This app keeps that rhythm
            and makes the hours you finish easy to see.
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-white px-5 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-text">How this app works</h3>
        <ol className="mt-3 flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-text">
          <li>
            <strong>Start a timer</strong> on Home. The default is 25 minutes,
            like a classic pomodoro.
          </li>
          <li>
            <strong>Grow tomatoes</strong> as you focus. Every 6 minutes of
            completed focus is 1 tomato.
          </li>
          <li>
            <strong>Plan the day</strong> with tasks and light routines. Finish
            every item in Today’s Plan to earn a Golden Tomato.
          </li>
          <li>
            <strong>Watch the garden</strong> grow each hour. Weekends earn twice the tomatoes, so the garden
            grows twice as fast.
          </li>
        </ol>
      </section>

      <section className="rounded-2xl bg-white px-5 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-text">Tomato collection</h3>
        <p className="mt-2 text-sm text-text-muted">
          What each tomato in the app means.
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {COLLECTION.map((tomato) => (
            <li key={tomato.variant} className="flex items-start gap-3">
              <Tomato variant={tomato.variant} size={28} className="mt-0.5 shrink-0" alt="" />
              <div>
                <p className="text-sm font-medium text-text">{tomato.name}</p>
                <p className="text-xs leading-relaxed text-text-muted">{tomato.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* <section className="rounded-2xl bg-white px-5 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-text">Examples</h3>
        <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-text">
          <li className="flex items-start gap-2.5">
            <Tomato size={20} className="mt-0.5 shrink-0" alt="" />
            <span>
              A 25-minute session on a weekday:{' '}
              <strong>4 tomatoes</strong> (25 minutes, 6 minutes each). The
              garden does not change yet, because a sapling needs 10 tomatoes.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Tomato size={20} className="mt-0.5 shrink-0" alt="" />
            <span>
              Two 30-minute sessions the same weekday:{' '}
              <strong>10 tomatoes</strong> and the plant moves to hour 1 (a
              sapling).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Tomato variant="joyous" size={20} className="mt-0.5 shrink-0" alt="" />
            <span>
              60 minutes on Saturday or Sunday:{' '}
              <strong>20 tomatoes</strong> (weekend 2×) and two hours of garden
              growth. Growth follows tomatoes, so the plant moves to hour 2.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Tomato variant="golden" size={20} className="mt-0.5 shrink-0" alt="" />
            <span>
              Check off breakfast, a work task, gym, and dinner in Today’s Plan:{' '}
              <strong>1 Golden Tomato</strong> for the day, on top of whatever
              you grew from the timer.
            </span>
          </li>
        </ul>
      </section> */}

      <section className="overflow-hidden rounded-2xl bg-white px-4 pb-5 pt-5 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-text">Hourly growth</h3>
        <p className="mt-2 text-sm text-text-muted">
          Every 10 tomatoes replaces the same plant with the next stage, from
          sprout to fruiting tree. A weekend hour is 20 tomatoes, so it skips
          ahead two stages.
        </p>
        <img
          src={GROWTH_IMAGE}
          alt="Six stages of a tomato plant from a sprout at hour 1 to a fruiting tree with fallen tomatoes at hour 6"
          className="mt-3 w-full rounded-xl object-contain"
        />
        <p className="mt-2 text-xs text-text-muted">
          Hour 1 sprout · hour 3 first fruit · hour 6 harvest on the ground
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white px-4 pb-5 pt-5 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-text">Try the garden</h3>
        <p className="mt-2 text-sm text-text-muted">
          Preview how the live garden looks after different hours. Try 1h, 6h,
          then 7h to see a second plant appear.
        </p>

        <div className="mt-3 overflow-hidden rounded-xl">
          <ForestScene hours={hours} />
        </div>

        <p className="mt-3 text-sm text-text-muted">
          {hours === 0
            ? 'Empty soil — grow 10 tomatoes to plant a sapling.'
            : `${hours} ${hours === 1 ? 'hour' : 'hours'} preview`}
        </p>

        <GardenHoursPreview
          hours={hours}
          actualHours={EXAMPLE_START_HOURS}
          onChange={setPreviewHours}
          onReset={() => setPreviewHours(EXAMPLE_START_HOURS)}
          resetLabel="Back to the 3-hour example"
          hint="Tap a preset. Hours 1–6 replace the same plant; hour 7 adds a new sapling."
        />
      </section>
    </div>
  )
}
