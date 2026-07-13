import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Closes any active debate and promotes the least-recently-used topic
 * from the pool to a fresh 24h active debate. Mirrors the original
 * APScheduler `update_daily_debate` job.
 */
export async function rotateDailyTopic() {
  await supabaseAdmin
    .from('debate_topics')
    .update({ status: 'closed' })
    .eq('status', 'active');

  // Prefer never-used topics, then the one used longest ago.
  const { data: candidates, error } = await supabaseAdmin
    .from('topic_pool')
    .select('id, title, description, used_at')
    .order('used_at', { ascending: true, nullsFirst: true })
    .limit(1);
  if (error || !candidates?.length) {
    throw new Error(`No topics available in topic_pool: ${error?.message ?? 'empty pool'}`);
  }
  const topic = candidates[0];

  const now = new Date();
  const { data: created, error: insertError } = await supabaseAdmin
    .from('debate_topics')
    .insert({
      title: topic.title,
      description: topic.description,
      start_time: now.toISOString(),
      end_time: new Date(now.getTime() + DAY_MS).toISOString(),
      status: 'active',
    })
    .select()
    .single();
  if (insertError) throw new Error(insertError.message);

  await supabaseAdmin
    .from('topic_pool')
    .update({ used_at: now.toISOString() })
    .eq('id', topic.id);

  return created;
}

/**
 * Returns the active debate, closing it first if its 24h window has
 * elapsed. When none is active a new one is rotated in automatically,
 * so the arena never renders empty (replaces the FastAPI startup hook).
 */
export async function getOrCreateActiveTopic() {
  const { data: active } = await supabaseAdmin
    .from('debate_topics')
    .select('*')
    .eq('status', 'active')
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active && new Date(active.end_time).getTime() > Date.now()) {
    return active;
  }
  return rotateDailyTopic();
}
