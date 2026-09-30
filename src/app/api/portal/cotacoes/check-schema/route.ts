import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import * as schema from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    availableTables: Object.keys(schema),
  });
}