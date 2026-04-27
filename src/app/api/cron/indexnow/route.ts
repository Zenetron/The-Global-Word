import { NextResponse } from 'next/server';
import { pingIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Optionnel : vérifier une clé secrète pour éviter que n'importe qui déclenche le ping
  // const { searchParams } = new URL(req.url);
  // if (searchParams.get('key') !== process.env.CRON_SECRET) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const result = await pingIndexNow();
  
  if (result.success) {
    return NextResponse.json({ message: 'IndexNow ping sent' });
  } else {
    return NextResponse.json({ error: 'Failed to send IndexNow ping', details: result.error }, { status: 500 });
  }
}
