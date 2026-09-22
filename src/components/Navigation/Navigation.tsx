import type { AppPage } from '../../types'

interface NavigationProps {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
}

const NAV_ITEMS: { page: AppPage; label: string; src: string }[] = [
  { page: 'home', label: 'Home', src: '/home.png' },
  { page: 'tasks', label: 'Tasks', src: '/tasks.png' },
  { page: 'garden', label: 'Garden', src: '/garden.svg' },
  { page: 'history', label: 'History', src: '/history.svg' },
]

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-cream-dark bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-3">
        {NAV_ITEMS.map(({ page, label, src }) => {
          const isActive = currentPage === page
          return (
            <button
              key={page}
              type="button"
              onClick={() => onNavigate(page)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? 'text-tomato'
                  : 'text-text-muted hover:text-text'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <img
                src={src}
                alt=""
                className={`h-8 w-8 object-contain ${isActive ? '' : 'opacity-55'}`}
              />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
