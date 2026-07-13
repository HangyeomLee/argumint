import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  total_score: number;
}

/** Resolves the Supabase user + profile from a Bearer token. Returns null when absent/invalid. */
export async function getCurrentUser(req: NextRequest): Promise<CurrentUser | null> {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length);

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, username, total_score')
    .eq('id', data.user.id)
    .single();
  if (!profile) return null;

  return {
    id: profile.id,
    email: data.user.email ?? '',
    username: profile.username,
    total_score: profile.total_score,
  };
}

/** FastAPI-compatible error body: axios callers read `err.response.data.detail`. */
export function apiError(status: number, detail: string) {
  return NextResponse.json({ detail }, { status });
}
