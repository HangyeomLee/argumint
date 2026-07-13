import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser, apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; postId: string } },
) {
  const user = await getCurrentUser(req);
  if (!user) return apiError(401, 'Could not validate credentials');

  const value = Number(req.nextUrl.searchParams.get('value'));
  if (![-1, 0, 1].includes(value)) return apiError(422, 'value must be -1, 0 or 1');

  // Atomic vote handling (counters, hot score, reputation, notification,
  // live activity) lives in the cast_vote Postgres function.
  const { data, error } = await supabaseAdmin.rpc('cast_vote', {
    p_post_id: Number(params.postId),
    p_user_id: user.id,
    p_value: value,
    p_username: user.username,
  });
  if (error) {
    if (error.message.includes('POST_NOT_FOUND')) return apiError(404, 'Post not found');
    return apiError(500, error.message);
  }

  return NextResponse.json({
    action: data.action,
    upvotes: data.upvotes,
    downvotes: data.downvotes,
  });
}
