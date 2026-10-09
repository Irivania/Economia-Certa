import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotationSuppliers, suppliers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quotationId, supplierId } = body;

    if (!quotationId || !supplierId) {
      return NextResponse.json({ error: 'quotationId e supplierId são obrigatórios.' }, { status: 400 });
    }

    // 1. Busca os dados do fornecedor/marca original enviado pela loja
    const [targetSupplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId));

    // Se o fornecedor tiver e-mail, procuramos o ID correto unificado no portal do representante
    let resolvedSupplierId = supplierId;
    if (targetSupplier?.email) {
      const [portalSupplier] = await db
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.email, targetSupplier.email));

      if (portalSupplier) {
        resolvedSupplierId = portalSupplier.id;
      }
    }

    // 2. Verifica se já existe um vínculo para este supplierId resolvido
    const [existing] = await db
      .select()
      .from(quotationSuppliers)
      .where(
        and(
          eq(quotationSuppliers.quotationId, quotationId),
          eq(quotationSuppliers.supplierId, resolvedSupplierId)
        )
      );

    if (existing) {
      await db
        .update(quotationSuppliers)
        .set({ status: 'PENDENTE' })
        .where(eq(quotationSuppliers.id, existing.id));

      return NextResponse.json({ success: true, message: 'Cotação já publicada anteriormente para este parceiro.' }, { status: 200 });
    }

    // 3. Gera o token e insere associando ao ID correto do portal
    const token = crypto.randomBytes(32).toString('hex');

    await db.insert(quotationSuppliers).values({
      quotationId,
      supplierId: resolvedSupplierId,
      status: 'PENDENTE',
      totalOffered: '0',
      token,
    });

    return NextResponse.json({ success: true, message: 'Cotação publicada com sucesso no portal do distribuidor!' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao publicar cotação no portal:', error);
    return NextResponse.json({ error: 'Erro interno ao publicar cotação.' }, { status: 500 });
  }
}