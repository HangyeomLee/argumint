import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

// Accepts the OAuth2-style form the original FastAPI endpoint used:
// `username` carries the email address.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return apiError(400, 'Incorrect email or password');
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    token_type: 'bearer',
  });
}
