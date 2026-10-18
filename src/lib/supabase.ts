import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function readEnv(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const url = readEnv(import.meta.env.VITE_SUPABASE_URL)
const anonKey = readEnv(import.meta.env.VITE_SUPABASE_ANON_KEY)

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = supabase !== null
