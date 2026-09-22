interface PlanRemoveButtonProps {
  title: string
  onRemove: () => void
}

export function PlanRemoveButton({ title, onRemove }: PlanRemoveButtonProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-text-muted hover:bg-tomato/10 hover:text-tomato"
      aria-label={`Remove "${title}" from today's plan`}
    >
      ×
    </button>
  )
}
