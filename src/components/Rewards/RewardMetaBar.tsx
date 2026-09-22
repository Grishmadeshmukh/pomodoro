interface RewardMetaBarProps {
  weekend: boolean
}

export function RewardMetaBar({ weekend }: RewardMetaBarProps) {
  if (!weekend) return null

  return (
    <div className="flex w-full justify-center">
      <p className="rounded-full bg-tomato/15 px-3 py-1 text-xs font-semibold text-tomato">
        2× Weekend Bonus
      </p>
    </div>
  )
}
