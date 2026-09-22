export type TomatoVariant =
  | 'default'
  | 'smiling'
  | 'sleepy'
  | 'joyous'
  | 'energised'
  | 'crying'
  | 'angry'
  | 'golden'

const TOMATO_ASSETS: Record<TomatoVariant, { src: string; alt: string }> = {
  default: { src: '/icon.png', alt: 'Tomato' },
  smiling: { src: '/smiling.svg', alt: 'Smiling tomato' },
  sleepy: { src: '/sleepy.png', alt: 'Sleepy tomato' },
  joyous: { src: '/joyous.png', alt: 'Joyous tomato' },
  energised: { src: '/energised.png', alt: 'Energised tomato' },
  crying: { src: '/crying.svg', alt: 'Crying tomato' },
  angry: { src: '/angry.png', alt: 'Angry tomato' },
  golden: { src: '/golden.png', alt: 'Golden tomato' },
}

interface TomatoProps {
  size?: number
  alt?: string
  variant?: TomatoVariant
  className?: string
}

export function Tomato({
  size = 24,
  alt,
  variant = 'default',
  className,
}: TomatoProps) {
  const asset = TOMATO_ASSETS[variant]

  return (
    <img
      src={asset.src}
      width={size}
      height={size}
      alt={alt ?? asset.alt}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}
