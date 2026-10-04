import { NextResponse } from 'next/server';
import * as schema from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    availableTables: Object.keys(schema),
  });
}