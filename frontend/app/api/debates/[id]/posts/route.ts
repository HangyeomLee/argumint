import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser, apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const topicId = Number(params.id);
  const sort = req.nextUrl.searchParams.get('sort') ?? 'hot';
  const user = await getCurrentUser(req); // optional

  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('topic_id', topicId);
  if (error) return apiError(500, error.message);

  // Attach author reputation for tier badges.
  const userIds = Array.from(new Set(posts.map((p) => p.user_id)));
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, total_score').in('id', userIds)
    : { data: [] as { id: string; total_score: number }[] };
  const scoreById = new Map((profiles ?? []).map((p) => [p.id, p.total_score]));

  // Attach the requesting user's own votes.
  const voteByPost = new Map<number, number>();
  if (user && posts.length) {
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('post_id, value')
      .eq('user_id', user.id)
      .in('post_id', posts.map((p) => p.id));
    for (const v of votes ?? []) voteByPost.set(v.post_id, v.value);
  }

  const enriched = posts.map((p) => ({
    ...p,
    author_score: scoreById.get(p.user_id) ?? 0,
    user_vote: voteByPost.get(p.id) ?? null,
  }));

  enriched.sort((a, b) => {
    if (sort === 'hot') return b.hot_score - a.hot_score;
    if (sort === 'top') return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError(401, 'Could not validate credentials');

  const topicId = Number(params.id);
  const body = await req.json().catch(() => null);
  if (!body?.content) return apiError(422, 'content is required');

  const { data: topic } = await supabaseAdmin
    .from('debate_topics')
    .select('id, status')
    .eq('id', topicId)
    .maybeSingle();
  if (!topic || topic.status !== 'active') return apiError(400, 'Debate is not active');

  const { data: participation } = await supabaseAdmin
    .from('participations')
    .select('side')
    .eq('topic_id', topicId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!participation) return apiError(400, 'You must join the debate first');

  let parent: { id: number; topic_id: number; user_id: string } | null = null;
  if (body.parent_post_id) {
    const { data } = await supabaseAdmin
      .from('posts')
      .select('id, topic_id, user_id')
      .eq('id', body.parent_post_id)
      .maybeSingle();
    if (!data) return apiError(404, 'Parent post not found');
    if (data.topic_id !== topicId) return apiError(400, 'Parent post belongs to another debate');
    parent = data;
  }

  const { data: post, error } = await supabaseAdmin
    .from('posts')
    .insert({
      topic_id: topicId,
      user_id: user.id,
      parent_post_id: body.parent_post_id ?? null,
      side: participation.side,
      type: body.type === 'rebuttal' ? 'rebuttal' : 'argument',
      title: body.title || null,
      content: body.content,
      username: user.username,
    })
    .select()
    .single();
  if (error) return apiError(500, error.message);

  if (parent && parent.user_id !== user.id) {
    await supabaseAdmin.from('notifications').insert({
      user_id: parent.user_id,
      type: 'reply',
      sender_id: user.id,
      sender_username: user.username,
      post_id: post.id,
    });
  }

  return NextResponse.json({ ...post, author_score: user.total_score, user_vote: null });
}
