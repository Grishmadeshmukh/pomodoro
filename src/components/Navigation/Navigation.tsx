import type { AppPage } from '../../types'

interface NavigationProps {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
  variant?: 'bottom' | 'top'
}

const NAV_ITEMS: { page: AppPage; label: string; src: string }[] = [
  { page: 'home', label: 'Home', src: '/home.png' },
  { page: 'tasks', label: 'Tasks', src: '/tasks.png' },
  { page: 'garden', label: 'Garden', src: '/garden.svg' },
  { page: 'history', label: 'History', src: '/history.svg' },
]

export function Navigation({
  currentPage,
  onNavigate,
  variant = 'bottom',
}: NavigationProps) {
  const buttons = NAV_ITEMS.map(({ page, label, src }) => {
    const isActive = currentPage === page
    return (
      <button
        key={page}
        type="button"
        onClick={() => onNavigate(page)}
        className={`flex items-center rounded-xl text-xs font-medium transition ${
          variant === 'top'
            ? 'gap-2 px-3 py-2'
            : 'flex-col gap-1 px-3 py-1.5'
        } ${isActive ? 'text-tomato' : 'text-text-muted hover:text-text'}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <img
          src={src}
          alt=""
          className={`object-contain ${
            variant === 'top' ? 'h-6 w-6' : 'h-8 w-8'
          } ${isActive ? '' : 'opacity-55'}`}
        />
        {label}
      </button>
    )
  })

  if (variant === 'top') {
    return <nav className="flex items-center gap-1">{buttons}</nav>
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-cream-dark bg-white">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-3">
        {buttons}
      </div>
    </nav>
  )
}
