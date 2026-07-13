import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser, apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError(401, 'Could not validate credentials');

  const { data, error } = await supabaseAdmin
    .from('participations')
    .select('*')
    .eq('topic_id', Number(params.id))
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return apiError(500, error.message);
  if (!data) return apiError(404, 'Not participating');
  return NextResponse.json(data);
}
