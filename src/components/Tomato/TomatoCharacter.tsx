import type { TomatoState } from '../../types'
import { Tomato, type TomatoVariant } from './Tomato'

interface TomatoCharacterProps {
  state?: TomatoState
  size?: number
}

const STATE_VARIANT: Record<TomatoState, TomatoVariant> = {
  idle: 'default',
  sleepy: 'sleepy',
  focusing: 'smiling',
  energised: 'energised',
  break: 'sleepy',
  completed: 'joyous',
  celebration: 'joyous',
  abandoned: 'crying',
  angry: 'angry',
}

export function TomatoCharacter({
  state = 'idle',
  size = 120,
}: TomatoCharacterProps) {
  const animationClass =
    state === 'celebration' || state === 'completed'
      ? 'animate-celebrate'
      : state === 'focusing' || state === 'energised'
        ? 'animate-bounce-gentle'
        : ''

  return (
    <div
      className={`inline-flex ${animationClass}`}
      role="img"
      aria-label={`Tomato companion — ${state}`}
    >
      <Tomato variant={STATE_VARIANT[state]} size={size} alt="" />
    </div>
  )
}
