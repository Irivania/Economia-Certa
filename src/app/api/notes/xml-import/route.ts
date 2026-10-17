import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { XMLParser } from 'fast-xml-parser';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Ficheiro XML não fornecido.' }, { status: 400 });
    }

    const xmlText = await file.text();
    
    // Configura o parser para ler a NF-e (modelo 55)
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlText);

    // Caminho padrão da NF-e na SEFAZ: nfeProc -> NFe -> infNFe
    const infNFe = jsonObj?.nfeProc?.NFe?.infNFe || jsonObj?.NFe?.infNFe;

    if (!infNFe) {
      return NextResponse.json({ error: 'Formato de XML de Nota Fiscal inválido ou não reconhecido.' }, { status: 400 });
    }

    const emitente = infNFe.emit?.xNome || 'Fornecedor Desconhecido';
    const numeroNota = infNFe.ide?.nNF || '';
    const chaveAcess = infNFe['@_Id']?.replace('NFe', '') || '';

    const rawDet = Array.isArray(infNFe.det) ? infNFe.det : [infNFe.det];
    const itensProcessados = [];

    for (const det of rawDet) {
      const prod = det.prod;
      const ean = prod.cEAN && prod.cEAN !== 'SEM GTIN' ? String(prod.cEAN).trim() : null;
      const descricaoNota = prod.xProd;
      const qtdNota = Number(prod.qCom);
      const valorUnitarioNota = Number(prod.vUnCom);
      const unidadeNota = String(prod.uCom).toUpperCase(); // Ex: CX, UN, PCT

      // Procura se o produto já existe no cadastro da empresa pelo EAN
      let productMatch = null;
      if (ean && companyId) {
        const [found] = await db
          .select()
          .from(products)
          .where(and(eq(products.companyId, companyId), eq(products.ean, ean)));
        productMatch = found;
      }

      // Lógica de Caixa vs Unidade (Fator de Conversão)
      let quantidadeRealEstoque = qtdNota;
      let custoRealUnitario = valorUnitarioNota;

      if (productMatch) {
        const unidadeInterna = productMatch.unit.toUpperCase(); // Ex: UN
        const itensPorCaixa = productMatch.boxQuantity || 1;

        // Se a nota veio em Caixa/Pacote e o sistema controla por Unidade
        if ((unidadeNota.includes('CX') || unidadeNota.includes('PCT')) && unidadeInterna === 'UN') {
          quantidadeRealEstoque = qtdNota * itensPorCaixa;
          custoRealUnitario = valorUnitarioNota / itensPorCaixa; // Rateia o custo por unidade
        }
      }

      itensProcessados.push({
        ean,
        descricaoNota,
        unidadeNota,
        qtdNota,
        quantidadeRealEstoque,
        valorUnitarioNota,
        custoRealUnitario,
        cadastradoNoSistema: !!productMatch,
        productId: productMatch?.id || null,
      });
    }

    return NextResponse.json({
      success: true,
      emitente,
      numeroNota,
      chaveAcess,
      itens: itensProcessados,
    });
  } catch (error: unknown) {
    console.error('Erro ao processar XML da nota:', error);
    const message = error instanceof Error ? error.message : 'Erro ao ler ficheiro XML.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}