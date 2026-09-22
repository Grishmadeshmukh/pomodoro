interface PlanInsertPointProps {
  onClick: () => void
}

export function PlanInsertPoint({ onClick }: PlanInsertPointProps) {
  return (
    <div className="group/insert flex h-5 items-center">
      <button
        type="button"
        onClick={onClick}
        className="flex h-5 w-full items-center justify-center rounded-full text-tomato opacity-50 transition hover:bg-tomato/10 hover:opacity-100 focus-visible:opacity-100"
        aria-label="Insert item here"
      >
        <span className="text-sm font-semibold leading-none">+</span>
      </button>
    </div>
  )
}
