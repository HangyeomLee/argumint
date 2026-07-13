import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser, apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError(401, 'Could not validate credentials');

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('id, type, sender_id, sender_username, post_id, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return apiError(500, error.message);
  return NextResponse.json(data);
}
