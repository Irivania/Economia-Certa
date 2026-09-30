import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotationSuppliers, quotations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido para debug.' }, { status: 400 });
    }

    const supplierRecords = await db
      .select()
      .from(quotationSuppliers)
      .where(eq(quotationSuppliers.token, token));

    const supplierRecord = supplierRecords?.[0] || null;

    let quotationDetails = null;
    if (supplierRecord) {
      const q = await db
        .select()
        .from(quotations)
        .where(eq(quotations.id, supplierRecord.quotationId));
      quotationDetails = q?.[0] || null;
    }

    return NextResponse.json({
      searchedToken: token,
      foundSupplierRecord: supplierRecord,
      associatedQuotation: quotationDetails,
      allTokensInDb: await db.select({ token: quotationSuppliers.token, status: quotationSuppliers.status }).from(quotationSuppliers),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}