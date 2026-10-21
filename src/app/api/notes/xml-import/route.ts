import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products, productCostHistory, importedInvoices, accountsPayable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { XMLParser } from 'fast-xml-parser';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface DupItem {
  nDup?: string;
  dVenc?: string;
  vDup?: string | number;
}

// Função auxiliar para tentar buscar imagem do produto via EAN em base de dados pública (Open Food Facts)
async function fetchProductImageByEAN(ean: string | null): Promise<string | null> {
  if (!ean) return null;
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${ean}.json`, {
      headers: { 'User-Agent': 'EconomiaCertaERP - EducationProject' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 1 && data.product && data.product.image_front_url) {
        return data.product.image_front_url;
      }
    }
  } catch (err) {
    console.error('Erro ao buscar imagem externa por EAN:', err);
  }
  return null;
}

// GET: Retornar o histórico de notas já importadas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID não informado.' }, { status: 400 });
    }

    const invoices = await db
      .select()
      .from(importedInvoices)
      .where(eq(importedInvoices.companyId, companyId))
      .orderBy(desc(importedInvoices.importedAt));

    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error('Erro ao buscar notas importadas:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar histórico de notas.' }, { status: 500 });
  }
}

// POST: Analisa o ficheiro XML, extrai itens, NCM, CEST, cClassTrib e boletos
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;

    if (!file || !companyId) {
      return NextResponse.json({ error: 'Ficheiro XML ou Empresa não fornecidos.' }, { status: 400 });
    }

    const xmlText = await file.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlText);

    const infNFe = jsonObj?.nfeProc?.NFe?.infNFe || jsonObj?.NFe?.infNFe;

    if (!infNFe) {
      return NextResponse.json({ error: 'Formato de XML de Nota Fiscal inválido ou não reconhecido.' }, { status: 400 });
    }

    const emitente = infNFe.emit?.xNome || 'Fornecedor Desconhecido';
    const numeroNota = infNFe.ide?.nNF || '';
    const chaveAcess = infNFe['@_Id']?.replace('NFe', '') || '';

    if (!chaveAcess) {
      return NextResponse.json({ error: 'Chave de acesso da NF-e não encontrada no XML.' }, { status: 400 });
    }

    const [existingInvoice] = await db
      .select()
      .from(importedInvoices)
      .where(and(eq(importedInvoices.companyId, companyId), eq(importedInvoices.accessKey, chaveAcess)))
      .limit(1);

    if (existingInvoice) {
      return NextResponse.json({
        error: `⚠️ BLOQUEIO DE SEGURANÇA: Esta nota fiscal (NF-e Nº ${numeroNota}) já foi dada entrada no sistema em ${new Date(existingInvoice.importedAt).toLocaleDateString('pt-BR')}!`,
      }, { status: 400 });
    }

    const totalNota = Number(infNFe.total?.ICMSTot?.vNF || 0);
    const totalDesconto = Number(infNFe.total?.ICMSTot?.vDesc || 0);

    const cobr = infNFe.cobr;
    const boletosExtraidos: Array<{ numeroFatura: string; vencimento: string; valor: number }> = [];

    if (cobr && cobr.dup) {
      const rawDup = Array.isArray(cobr.dup) ? cobr.dup : [cobr.dup];
      rawDup.forEach((d: DupItem, index: number) => {
        const numDup = d.nDup || `00${index + 1}`;
        const vencDup = d.dVenc || new Date().toISOString().split('T')[0];
        const valDup = Number(d.vDup || 0);
        boletosExtraidos.push({
          numeroFatura: `${numeroNota}/${numDup}`,
          vencimento: vencDup,
          valor: Number(valDup.toFixed(2)),
        });
      });
    } else {
      boletosExtraidos.push({
        numeroFatura: `${numeroNota}/001`,
        vencimento: new Date().toISOString().split('T')[0],
        valor: Number(totalNota.toFixed(2)),
      });
    }

    const rawDet = Array.isArray(infNFe.det) ? infNFe.det : [infNFe.det];
    const itensProcessados = [];

    for (const det of rawDet) {
      const prod = det.prod;
      const imposto = det.imposto;

      const ean = prod.cEAN && prod.cEAN !== 'SEM GTIN' ? String(prod.cEAN).trim() : null;
      const descricaoNota = prod.xProd;
      const qtdNota = Number(prod.qCom);
      const valorUnitarioNota = Number(prod.vUnCom);
      const unidadeNota = String(prod.uCom).toUpperCase();
      
      const ncm = prod.NCM ? String(prod.NCM).trim() : null;
      const cest = prod.CEST ? String(prod.CEST).trim() : null;

      // Extração da Classificação Tributária para Reforma Tributária (IBS/CBS) se disponível no XML
      let classTrib = null;
      if (imposto) {
        // Tenta detetar tags comuns de classificação tributária ou regime
        classTrib = imposto.cClassTrib || imposto.ICMS?.cClassTrib || null;
      }

      let productMatch = null;
      if (ean && companyId) {
        const [found] = await db
          .select()
          .from(products)
          .where(and(eq(products.companyId, companyId), eq(products.ean, ean)));
        productMatch = found;
      }

      let quantidadeRealEstoque = qtdNota;
      let custoRealUnitario = valorUnitarioNota;

      if (productMatch) {
        const unidadeInterna = productMatch.unit.toUpperCase();
        const itensPorCaixa = productMatch.boxQuantity || 1;

        if ((unidadeNota.includes('CX') || unidadeNota.includes('PCT')) && unidadeInterna === 'UN') {
          quantidadeRealEstoque = qtdNota * itensPorCaixa;
          custoRealUnitario = valorUnitarioNota / itensPorCaixa;
        }
      }

      itensProcessados.push({
        ean,
        descricaoNota,
        unidadeNota,
        qtdNota,
        quantidadeRealEstoque,
        valorUnitarioNota,
        custoRealUnitario: Number(custoRealUnitario.toFixed(2)),
        ncm,
        cest,
        classTrib,
        cadastradoNoSistema: !!productMatch,
        productId: productMatch?.id || null,
      });
    }

    return NextResponse.json({
      success: true,
      emitente,
      numeroNota,
      chaveAcess,
      totalNota,
      totalDesconto,
      boletos: boletosExtraidos,
      itens: itensProcessados,
    });
  } catch (error: unknown) {
    console.error('Erro ao processar XML da nota:', error);
    const message = error instanceof Error ? error.message : 'Erro ao ler ficheiro XML.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Confirma entrada, busca imagem externa via EAN se novo, grava NCM/CEST/ClassTrib e lança boletos
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, emitente, numeroNota, chaveAcess, itens, boletos } = body;

    if (!companyId || !chaveAcess || !Array.isArray(itens)) {
      return NextResponse.json({ error: 'Dados inválidos para confirmação da nota.' }, { status: 400 });
    }

    const [existingInvoice] = await db
      .select()
      .from(importedInvoices)
      .where(and(eq(importedInvoices.companyId, companyId), eq(importedInvoices.accessKey, chaveAcess)))
      .limit(1);

    if (existingInvoice) {
      return NextResponse.json({ error: 'Esta nota fiscal já foi processada anteriormente.' }, { status: 400 });
    }

    let totalNotaAmount = 0;

    for (const item of itens) {
      let targetProductId = item.productId;
      const itemSubtotal = Number(item.quantidadeRealEstoque) * Number(item.custoRealUnitario);
      totalNotaAmount += itemSubtotal;

      if (!targetProductId) {
        // Tenta buscar imagem automaticamente pelo código de barras (EAN)
        const externalImageUrl = await fetchProductImageByEAN(item.ean);

        const newProductId = crypto.randomUUID();
        await db.insert(products).values({
          id: newProductId,
          companyId,
          description: item.descricaoNota,
          ean: item.ean || null,
          unit: item.unidadeNota || 'UN',
          costPrice: String(item.custoRealUnitario),
          salePrice: String(item.custoRealUnitario * 1.3),
          stockCurrent: Number(item.quantidadeRealEstoque),
          ncm: item.ncm || null,
          cest: item.cest || null,
          classTrib: item.classTrib || null,
          imageUrl: externalImageUrl || null, // Anexa a foto encontrada automaticamente se houver EAN
        });
        targetProductId = newProductId;
      } else {
        const [existingProd] = await db
          .select()
          .from(products)
          .where(eq(products.id, targetProductId))
          .limit(1);

        if (existingProd) {
          const updatedStock = Number(existingProd.stockCurrent || 0) + Number(item.quantidadeRealEstoque);
          await db
            .update(products)
            .set({
              costPrice: String(item.custoRealUnitario),
              stockCurrent: updatedStock,
              ncm: item.ncm || existingProd.ncm,
              cest: item.cest || existingProd.cest,
              classTrib: item.classTrib || existingProd.classTrib,
            })
            .where(eq(products.id, targetProductId));
        }
      }

      await db.insert(productCostHistory).values({
        id: crypto.randomUUID(),
        companyId,
        productId: targetProductId,
        supplierName: emitente || 'Fornecedor XML',
        invoiceNumber: numeroNota || 'N/A',
        unitCost: String(item.custoRealUnitario),
        quantity: String(item.quantidadeRealEstoque),
        purchasedBy: 'Entrada NF-e (XML)',
      });
    }

    // Lançar boletos automaticamente no Contas a Pagar
    if (Array.isArray(boletos)) {
      for (const bol of boletos) {
        await db.insert(accountsPayable).values({
          id: crypto.randomUUID(),
          companyId,
          supplierName: emitente,
          invoiceNumber: bol.numeroFatura || numeroNota,
          amount: String(bol.valor),
          dueDate: bol.vencimento,
          status: 'PENDING',
        });
      }
    }

    // Registar a chave contra duplicidade
    await db.insert(importedInvoices).values({
      id: crypto.randomUUID(),
      companyId,
      accessKey: chaveAcess,
      invoiceNumber: String(numeroNota || '000'),
      issuerName: emitente,
      totalAmount: String(totalNotaAmount),
    });

    return NextResponse.json({ success: true, message: 'Nota processada, fotos via EAN anexadas, NCM/ClassTrib salvos e boletos gerados!' });
  } catch (error: unknown) {
    console.error('Erro ao efetivar entrada da nota:', error);
    const message = error instanceof Error ? error.message : 'Erro ao atualizar stock.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}