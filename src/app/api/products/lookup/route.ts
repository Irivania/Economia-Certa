import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { lookupFiscalByNcm } from '@/lib/fiscalDatabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ean = searchParams.get('ean');
    const ncmQuery = searchParams.get('ncm');

    // 1. Se a consulta for por NCM (Automação Fiscal Instantânea)
    if (ncmQuery) {
      const fiscalInfo = lookupFiscalByNcm(ncmQuery);
      if (fiscalInfo) {
        return NextResponse.json({ source: 'fiscal_table', ...fiscalInfo });
      }
      return NextResponse.json({ found: false });
    }

    // 2. Se a consulta for por Código de Barras (EAN)
    if (!ean || ean.trim().length < 8) {
      return NextResponse.json({ error: 'EAN inválido ou muito curto.' }, { status: 400 });
    }

    const cleanEan = ean.trim();

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.ean, cleanEan));

    if (existingProduct) {
      return NextResponse.json({
        source: 'local',
        description: existingProduct.description,
        brand: existingProduct.brand,
        imageUrl: existingProduct.imageUrl,
        ncm: existingProduct.ncm,
        cest: existingProduct.cest,
        classTrib: existingProduct.classTrib,
        unit: existingProduct.unit,
      });
    }

    // Simulação oficial baseada no prefixo do EAN nacional (789)
    if (cleanEan.startsWith('789')) {
      return NextResponse.json({
        source: 'external_simulation',
        description: 'PRODUTO HOMOLOGADO NACIONAL',
        brand: 'MARCA REFERÊNCIA',
        ncm: '33059000',
        cest: '20.028.00',
        classTrib: '000102',
        unit: 'UN',
      });
    }

    return NextResponse.json({ found: false, message: 'Produto não encontrado.' });
  } catch (error) {
    console.error('Erro na consulta automática:', error);
    return NextResponse.json({ error: 'Erro interno na consulta.' }, { status: 500 });
  }
}