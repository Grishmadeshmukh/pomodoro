import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/useAuth'
import { isSupabaseConfigured } from '../../lib/supabase'
import { subscribeSyncStatus } from '../../sync/syncEngine'
import type { AppPage } from '../../types'
import { Navigation } from '../Navigation/Navigation'
import { Tomato } from '../Tomato/Tomato'

function googleDisplayName(session: Session): string {
  const metadata = session.user.user_metadata
  const fullName = metadata.full_name
  const name = metadata.name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  if (typeof name === 'string' && name.trim()) return name.trim()
  return session.user.email ?? 'Signed in'
}

function HeaderAuth() {
  const { session, ready, signInWithGoogle, signOut } = useAuth()
  const [notSynced, setNotSynced] = useState(false)

  useEffect(() => subscribeSyncStatus(setNotSynced), [])

  if (!isSupabaseConfigured || !ready) return null

  if (!session) {
    return (
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="mt-2 text-sm font-medium text-tomato hover:text-tomato-dark"
      >
        Sign in with Google
      </button>
    )
  }

  return (
    <div className="mt-2">
      <p className="flex items-center justify-center gap-3 text-sm">
        <span className="max-w-48 truncate font-medium text-text">{googleDisplayName(session)}</span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="font-medium text-text-muted hover:text-tomato"
        >
          Sign out
        </button>
      </p>
      {notSynced ? (
        <p className="mt-1 text-xs text-text-muted" aria-live="polite">
          Not synced
        </p>
      ) : null}
    </div>
  )
}

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
        <HeaderAuth />
      </header>
      <main className="px-6">{children}</main>
      <Navigation currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  )
}
