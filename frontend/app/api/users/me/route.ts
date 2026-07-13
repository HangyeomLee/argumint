import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, apiError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError(401, 'Could not validate credentials');
  return NextResponse.json(user);
}
