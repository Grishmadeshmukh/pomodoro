interface RewardCardProps {
  points: number
}

export function RewardCard({ points }: RewardCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-tomato/10 to-tomato-light/10 px-5 py-4 shadow-sm">
      <span className="text-3xl">⭐</span>
      <div className="flex flex-col">
        <span className="text-sm text-text-muted">Focus points</span>
        <span className="text-2xl font-semibold text-tomato">+{points}</span>
      </div>
    </div>
  )
}
