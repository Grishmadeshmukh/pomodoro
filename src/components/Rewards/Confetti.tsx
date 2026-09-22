import { useMemo } from 'react'

interface ConfettiProps {
  active: boolean
}

const PIECES = [
  { left: '12%', delay: '0ms', color: '#e85d4c', rotate: 20 },
  { left: '22%', delay: '40ms', color: '#ff8a7a', rotate: -12 },
  { left: '32%', delay: '80ms', color: '#6bbf59', rotate: 28 },
  { left: '42%', delay: '20ms', color: '#e85d4c', rotate: -24 },
  { left: '52%', delay: '60ms', color: '#c94a3a', rotate: 16 },
  { left: '62%', delay: '10ms', color: '#ff8a7a', rotate: -8 },
  { left: '72%', delay: '90ms', color: '#6bbf59', rotate: 32 },
  { left: '82%', delay: '30ms', color: '#e85d4c', rotate: -18 },
]

export function Confetti({ active }: ConfettiProps) {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  if (!active || reducedMotion) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {PIECES.map((piece) => (
        <span
          key={piece.left}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
