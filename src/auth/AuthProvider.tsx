import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { startSyncEngine } from '../sync/syncEngine'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(supabase === null)

  useEffect(() => {
    if (!supabase) return

    let ignoreInitialSession = false

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!ignoreInitialSession) setSession(data.session)
      })
      .catch(() => {
        if (!ignoreInitialSession) setSession(null)
      })
      .finally(() => {
        if (!ignoreInitialSession) setReady(true)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      ignoreInitialSession = true
      setSession(nextSession)
      setReady(true)
    })

    return () => {
      ignoreInitialSession = true
      subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return
    return startSyncEngine(userId)
  }, [userId])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({ session, ready, signInWithGoogle, signOut }),
    [session, ready, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
