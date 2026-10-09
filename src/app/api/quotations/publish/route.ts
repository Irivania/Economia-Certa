import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { quotationSuppliers, suppliers, quotations } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import crypto from 'crypto';
import {
  resolvePortalSupplierId,
  resolveQuotationBrandId,
} from '@/services/quotationService';
import { requireCompanySession } from '@/lib/authServer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = requireCompanySession(request);
    const body = await request.json();
    const { quotationId, supplierId, quotationSupplierId } = body;

    if (quotationSupplierId) {
      const [link] = await db
        .select({
          id: quotationSuppliers.id,
          quotationId: quotationSuppliers.quotationId,
          companyId: quotations.companyId,
        })
        .from(quotationSuppliers)
        .innerJoin(quotations, eq(quotationSuppliers.quotationId, quotations.id))
        .where(eq(quotationSuppliers.id, String(quotationSupplierId)));

      if (!link || link.companyId !== session.companyId || link.quotationId !== String(quotationId || link.quotationId)) {
        return NextResponse.json({ error: 'Vínculo de cotação não encontrado.' }, { status: 404 });
      }

      const [currentLink] = await db
        .select({ status: quotationSuppliers.status })
        .from(quotationSuppliers)
        .where(eq(quotationSuppliers.id, link.id));

      if (currentLink?.status === 'ENVIADO' || currentLink?.status === 'RESPONDIDO') {
        return NextResponse.json({
          success: true,
          alreadySent: true,
          message: currentLink.status === 'RESPONDIDO'
            ? 'Este representante já respondeu à cotação.'
            : 'Esta cotação já foi enviada para este representante.',
        });
      }

      await db
        .update(quotationSuppliers)
        .set({ status: 'ENVIADO' })
        .where(eq(quotationSuppliers.id, link.id));

      return NextResponse.json({ success: true, message: 'Cotação enviada diretamente ao painel do representante.' });
    }

    if (!quotationId || !supplierId) {
      return NextResponse.json({ error: 'quotationId e supplierId são obrigatórios.' }, { status: 400 });
    }

    const [quotation] = await db.select({ companyId: quotations.companyId }).from(quotations).where(eq(quotations.id, String(quotationId)));
    if (!quotation || quotation.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Cotação não encontrada.' }, { status: 404 });
    }

    // 1. Busca o fornecedor original selecionado pela loja.
    const [targetSupplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId));

    if (!targetSupplier) {
      return NextResponse.json({ error: 'Fornecedor não encontrado.' }, { status: 404 });
    }

    const resolvedSupplierId = await resolvePortalSupplierId(supplierId);
    const brandId = await resolveQuotationBrandId(supplierId);

    // 2. O mesmo representante pode responder separadamente por várias marcas.
    const brandCondition = brandId
      ? eq(quotationSuppliers.brandId, brandId)
      : isNull(quotationSuppliers.brandId);
    const [existing] = await db
      .select()
      .from(quotationSuppliers)
      .where(
        and(
          eq(quotationSuppliers.quotationId, quotationId),
          eq(quotationSuppliers.supplierId, resolvedSupplierId),
          brandCondition,
        )
      );

    if (existing) {
      await db
        .update(quotationSuppliers)
        .set({ status: 'ENVIADO' })
        .where(eq(quotationSuppliers.id, existing.id));

      return NextResponse.json({ success: true, message: 'Cotação já publicada anteriormente para este parceiro.' }, { status: 200 });
    }

    // 3. Gera o token e insere associando ao ID correto do portal
    const token = crypto.randomBytes(32).toString('hex');

    await db.insert(quotationSuppliers).values({
      quotationId,
      supplierId: resolvedSupplierId,
      brandId,
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