import { createClient } from '@supabase/supabase-js'
let client = null
try {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (url && key) client = createClient(url, key)
} catch { /* Connection settings show missing or invalid configuration. */ }
export const supabase = client
