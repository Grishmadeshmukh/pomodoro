import type { ReactNode } from 'react'
import type { AppPage } from '../../types'
import { Navigation } from '../Navigation/Navigation'
import { Tomato } from '../Tomato/Tomato'

interface LayoutProps {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
  children: ReactNode
}

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const onAbout = currentPage === 'about'

  return (
    <div className="mx-auto min-h-screen max-w-lg pb-24">
      <header className="px-6 pt-8 pb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          <button
            type="button"
            onClick={() => onNavigate(onAbout ? 'home' : 'about')}
            className={`rounded-xl px-2 py-1 transition ${
              onAbout ? 'text-tomato' : 'hover:text-tomato'
            }`}
            aria-current={onAbout ? 'page' : undefined}
            aria-label={onAbout ? 'Back to home' : 'About Pomodoro'}
          >
            Pomodoro{' '}
            <Tomato size={28} className="inline-block align-middle" alt="" />
          </button>
        </h1>
      </header>
      <main className="px-6">{children}</main>
      <Navigation currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  )
}
