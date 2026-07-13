import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = body?.username?.trim();
  const email = body?.email?.trim();
  const password = body?.password;

  if (!username || !email || !password) {
    return apiError(400, 'username, email and password are required');
  }
  if (password.length < 6) {
    return apiError(400, 'Password must be at least 6 characters');
  }

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .maybeSingle();
  if (existing) {
    return apiError(400, 'The user with this username already exists in the system');
  }

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !created.user) {
    const duplicate = error?.message.toLowerCase().includes('already');
    return apiError(
      duplicate ? 400 : 500,
      duplicate
        ? 'The user with this email already exists in the system'
        : `Registration failed: ${error?.message ?? 'unknown error'}`,
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({ id: created.user.id, username })
    .select()
    .single();
  if (profileError) {
    // Roll back the auth user so the email isn't orphaned.
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return apiError(400, 'The user with this username already exists in the system');
  }

  // Sign in right away so the client can skip the login page.
  const { data: signIn } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  return NextResponse.json({
    id: profile.id,
    username: profile.username,
    email,
    total_score: profile.total_score,
    created_at: profile.created_at,
    access_token: signIn?.session?.access_token ?? null,
    token_type: 'bearer',
  });
}
