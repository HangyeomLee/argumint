import { NextResponse } from 'next/server';
import { getOrCreateActiveTopic } from '@/lib/server/topics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const debate = await getOrCreateActiveTopic();
    return NextResponse.json(debate);
  } catch (e: any) {
    return NextResponse.json({ detail: e.message ?? 'No active debate found' }, { status: 404 });
  }
}
