import 'server-only';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service-role client: bypasses RLS, must only ever be imported from
// route handlers / server components ("server-only" enforces this).
// cache: 'no-store' opts every request out of Next's data cache, which
// would otherwise serve stale query results from route handlers.
export const supabaseAdmin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
  },
});
