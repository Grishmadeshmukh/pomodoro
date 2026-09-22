import { useMemo } from 'react'

interface TomatoSplashProps {
  active: boolean
}

const SPLASHES = [
  { id: 1, top: '24%', left: '30%', width: 260, rotate: -20, delay: '0ms' },
  { id: 2, top: '48%', left: '72%', width: 280, rotate: 14, delay: '420ms' },
  { id: 3, top: '72%', left: '42%', width: 270, rotate: -8, delay: '840ms' },
] as const

export function TomatoSplash({ active }: TomatoSplashProps) {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  if (!active || reducedMotion) return null

  return (
    <div
      className="tomato-splash-layer pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {SPLASHES.map((splash) => (
        <img
          key={splash.id}
          src="/tomatoSplash.svg"
          alt=""
          draggable={false}
          className="tomato-splash select-none"
          style={{
            top: splash.top,
            left: splash.left,
            width: splash.width,
            animationDelay: splash.delay,
            ['--splash-rotate' as string]: `${splash.rotate}deg`,
          }}
        />
      ))}
    </div>
  )
}
