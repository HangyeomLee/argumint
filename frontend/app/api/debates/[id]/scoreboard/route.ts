import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const topicId = Number(params.id);

  const [postsRes, proCountRes, conCountRes] = await Promise.all([
    supabaseAdmin.from('posts').select('side, upvotes, downvotes').eq('topic_id', topicId),
    supabaseAdmin
      .from('participations')
      .select('id', { count: 'exact', head: true })
      .eq('topic_id', topicId)
      .eq('side', 'PRO'),
    supabaseAdmin
      .from('participations')
      .select('id', { count: 'exact', head: true })
      .eq('topic_id', topicId)
      .eq('side', 'CON'),
  ]);
  if (postsRes.error) return apiError(500, postsRes.error.message);

  let proScore = 0;
  let conScore = 0;
  for (const p of postsRes.data ?? []) {
    const score = p.upvotes - p.downvotes;
    if (p.side === 'PRO') proScore += score;
    else conScore += score;
  }

  return NextResponse.json({
    pro_score: proScore,
    con_score: conScore,
    pro_count: proCountRes.count ?? 0,
    con_count: conCountRes.count ?? 0,
  });
}
