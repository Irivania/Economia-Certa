import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const targetMarginParam = searchParams.get('targetMargin');
    const targetMargin = targetMarginParam ? Number(targetMarginParam) : 40;

    const query = db.select().from(products).orderBy(asc(products.description));
    const allProducts = companyId 
      ? await query.where(eq(products.companyId, companyId)) 
      : await query;

    const totalCatalogo = allProducts.length;
    let produtosAlerta = 0;
    let somaMargens = 0;

    const analyzedProducts = allProducts.map((p) => {
      const custo = Number(p.costPrice || 0);
      const venda = Number(p.salePrice || 0);
      
      let margemAtual = 0;
      if (venda > 0 && custo > 0) {
        margemAtual = ((venda - custo) / venda) * 100;
      } else if (venda > 0 && custo === 0) {
        margemAtual = 100; // Sem custo cadastrado assume margem total
      }

      const abaixoDaMeta = margemAtual < targetMargin;
      if (abaixoDaMeta) produtosAlerta++;
      somaMargens += margemAtual;

      return {
        id: p.id,
        description: p.description,
        brand: p.brand || 'Geral',
        ean: p.ean,
        imageUrl: p.imageUrl,
        costPrice: custo,
        salePrice: venda,
        stockCurrent: p.stockCurrent || 0,
        margin: Number(margemAtual.toFixed(2)),
        status: abaixoDaMeta ? 'ALERTA_MARGEM' : 'SAUDAVEL',
      };
    });

    const margemMediaGeral = totalCatalogo > 0 ? somaMargens / totalCatalogo : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalProducts: totalCatalogo,
        alertCount: produtosAlerta,
        averageMargin: Number(margemMediaGeral.toFixed(2)),
        targetMargin,
      },
      products: analyzedProducts,
    });
  } catch (error: unknown) {
    console.error('Erro ao gerar relatório de margens:', error);
    const message = error instanceof Error ? error.message : 'Erro interno ao calcular margens.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}