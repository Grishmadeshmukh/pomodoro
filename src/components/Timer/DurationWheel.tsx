import { useEffect, useRef } from 'react'

const ITEM_HEIGHT = 40
const VISIBLE_ITEMS = 5

interface DurationWheelProps {
  values: number[]
  value: number
  ariaLabel: string
  formatValue: (value: number) => string
  onChange: (value: number) => void
  autoFocus?: boolean
}

export function DurationWheel({
  values,
  value,
  ariaLabel,
  formatValue,
  onChange,
  autoFocus = false,
}: DurationWheelProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const skipScrollRef = useRef(true)
  const readyRef = useRef(false)
  const pad = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT
  const selectedIndex = Math.max(0, values.indexOf(value))

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const index = Math.max(0, values.indexOf(value))
    readyRef.current = false
    skipScrollRef.current = true
    scroller.scrollTop = index * ITEM_HEIGHT
    const id = window.setTimeout(() => {
      skipScrollRef.current = false
      readyRef.current = true
    }, 200)
    return () => window.clearTimeout(id)
  }, [value, values])

  function emitFromScroll() {
    const scroller = scrollerRef.current
    if (!scroller || skipScrollRef.current || !readyRef.current) return
    const index = Math.round(scroller.scrollTop / ITEM_HEIGHT)
    const next = values[Math.max(0, Math.min(values.length - 1, index))]
    if (next != null && next !== value) onChange(next)
  }

  function handleScroll() {
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(emitFromScroll)
  }

  return (
    <div className="relative w-[5.5rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1 top-1/2 z-[1] h-10 -translate-y-1/2 rounded-xl bg-tomato/10"
      />
      <div
        ref={scrollerRef}
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={`${ariaLabel}-${value}`}
        tabIndex={0}
        autoFocus={autoFocus}
        onScroll={handleScroll}
        onKeyDown={(event) => {
          const index = values.indexOf(value)
          if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            event.preventDefault()
            const next = values[Math.min(values.length - 1, index + 1)]
            if (next != null) onChange(next)
          }
          if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            event.preventDefault()
            const next = values[Math.max(0, index - 1)]
            if (next != null) onChange(next)
          }
        }}
        className="duration-wheel relative overflow-y-auto overscroll-contain"
        style={{
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div aria-hidden="true" style={{ height: pad }} />
        {values.map((option, index) => {
          const distance = Math.abs(index - selectedIndex)
          const selected = option === value
          return (
            <button
              key={option}
              type="button"
              id={`${ariaLabel}-${option}`}
              role="option"
              aria-selected={selected}
              onClick={() => onChange(option)}
              className={`flex w-full items-center justify-center snap-center text-lg transition-colors ${
                selected
                  ? 'font-semibold text-tomato'
                  : distance === 1
                    ? 'text-text-muted'
                    : 'text-text-muted/35'
              }`}
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
              }}
            >
              {formatValue(option)}
            </button>
          )
        })}
        <div aria-hidden="true" style={{ height: pad }} />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-cream to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-cream to-transparent"
      />
    </div>
  )
}
