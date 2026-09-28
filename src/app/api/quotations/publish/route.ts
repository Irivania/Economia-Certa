import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotations, quotationSuppliers } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quotationId, supplierId } = body;

    if (!quotationId || !supplierId) {
      return NextResponse.json({ error: 'quotationId e supplierId são obrigatórios.' }, { status: 400 });
    }

    const [quotation] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, quotationId));

    if (!quotation) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    const [existing] = await db
      .select()
      .from(quotationSuppliers)
      .where(
        and(
          eq(quotationSuppliers.quotationId, quotationId),
          eq(quotationSuppliers.supplierId, supplierId)
        )
      );

    if (existing) {
      await db
        .update(quotationSuppliers)
        .set({ status: 'PENDING' })
        .where(eq(quotationSuppliers.id, existing.id));
    } else {
      await db.insert(quotationSuppliers).values({
        id: crypto.randomUUID(),
        quotationId,
        supplierId,
        status: 'PENDING',
        token: crypto.randomUUID(),
      });
    }

    return NextResponse.json({ success: true, message: 'Cotação publicada com sucesso no portal!' });
  } catch (error) {
    console.error('Erro ao publicar cotação:', error);
    return NextResponse.json({ error: 'Erro interno ao publicar cotação.' }, { status: 500 });
  }
}