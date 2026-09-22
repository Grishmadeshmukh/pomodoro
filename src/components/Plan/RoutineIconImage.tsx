import type { RoutineIcon } from '../../types'
import { ROUTINE_ICON_SRC } from '../../utils/defaultRoutine'

interface RoutineIconImageProps {
  icon: RoutineIcon
  size?: number
}

export function RoutineIconImage({ icon, size = 32 }: RoutineIconImageProps) {
  return (
    <img
      src={ROUTINE_ICON_SRC[icon]}
      alt=""
      width={size}
      height={size}
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  )
}
