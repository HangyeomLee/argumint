import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

// Single-debate lookup, used by the dashboard when browsing archived battles.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseAdmin
    .from('debate_topics')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (error) return apiError(500, error.message);
  if (!data) return apiError(404, 'Debate not found');
  return NextResponse.json(data);
}
