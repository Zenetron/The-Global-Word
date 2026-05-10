import { NextResponse } from 'next/server';
import { pingIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {

  const result = await pingIndexNow();
  
  if (result.success) {
    return NextResponse.json({ message: 'IndexNow ping sent' });
  } else {
    return NextResponse.json({ error: 'Failed to send IndexNow ping', details: result.error }, { status: 500 });
  }
}
