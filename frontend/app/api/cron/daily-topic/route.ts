import { NextRequest, NextResponse } from 'next/server';
import { rotateDailyTopic } from '@/lib/server/topics';

export const dynamic = 'force-dynamic';

// Invoked by Vercel Cron (see vercel.json) every day at 06:00 KST.
// Vercel automatically sends `Authorization: Bearer ${CRON_SECRET}`.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  try {
    const topic = await rotateDailyTopic();
    return NextResponse.json({ status: 'rotated', topic: topic.title });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
