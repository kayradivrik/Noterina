import { getSupabase, isSupabaseConfigured } from '../store/useSupabaseStore'

export { getSupabase, isSupabaseConfigured }

export function supabaseConfigured(): boolean {
  return isSupabaseConfigured()
}
