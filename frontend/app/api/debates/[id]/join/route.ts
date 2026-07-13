import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser, apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError(401, 'Could not validate credentials');

  const side = req.nextUrl.searchParams.get('side');
  if (side !== 'PRO' && side !== 'CON') return apiError(422, 'side must be PRO or CON');

  const topicId = Number(params.id);
  const { data: debate } = await supabaseAdmin
    .from('debate_topics')
    .select('id, status')
    .eq('id', topicId)
    .maybeSingle();
  if (!debate) return apiError(404, 'Debate not found');
  if (debate.status !== 'active') return apiError(400, 'Debate is not active');

  const { data: participation, error } = await supabaseAdmin
    .from('participations')
    .insert({ user_id: user.id, topic_id: topicId, side })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') return apiError(400, 'Already joined this debate');
    return apiError(500, error.message);
  }

  // Feeds the realtime "Live Activity" panel.
  await supabaseAdmin.from('activities').insert({
    topic_id: topicId,
    username: user.username,
    action: 'joined',
    target: side === 'PRO' ? 'the Support side' : 'the Oppose side',
  });

  return NextResponse.json(participation);
}
