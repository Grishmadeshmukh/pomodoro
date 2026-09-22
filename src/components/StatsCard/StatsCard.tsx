interface StatsCardProps {
  label: string
  value: string
  icon?: string
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <span className="text-2xl font-semibold text-text">{value}</span>
    </div>
  )
}
