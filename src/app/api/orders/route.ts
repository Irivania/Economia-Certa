import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { calculateKitStock, deductKitComponentsStock } from '@/lib/productComposition';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json({ error: 'O ID da empresa é obrigatório.' }, { status: 400 });
    }

    // Retorna a listagem de pedidos/vendas da empresa
    return NextResponse.json([]);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar pedidos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, items } = body;

    if (!companyId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Dados insuficientes para processar o pedido/venda.' }, { status: 400 });
    }

    // 💡 PASSO 1: Validação prévia de estoque para todos os itens do pedido
    for (const item of items) {
      const productId = item.productId;
      const soldQuantity = Number(item.quantity || 0);

      if (!productId || soldQuantity <= 0) continue;

      const [productRecord] = await db
        .select({
          description: products.description,
          isKit: products.isKit,
          useFixedStock: products.useFixedStock,
          stockCurrent: products.stockCurrent,
        })
        .from(products)
        .where(eq(products.id, productId));

      if (!productRecord) {
        return NextResponse.json({ error: `Produto ID ${productId} não encontrado.` }, { status: 404 });
      }

      // Calcula o estoque real disponível (considerando o gargalo se for kit dinâmico)
      let availableStock = productRecord.stockCurrent || 0;
      if (productRecord.isKit && !productRecord.useFixedStock) {
        availableStock = await calculateKitStock(productId);
      }

      // Se o estoque for menor do que o solicitado, bloqueia o pedido preventivamente
      if (availableStock < soldQuantity) {
        return NextResponse.json(
          { 
            error: `Estoque insuficiente para "${productRecord.description}". Disponível: ${availableStock}, Solicitado: ${soldQuantity}` 
          },
          { status: 400 }
        );
      }
    }

    // 💡 PASSO 2: Se passou por todas as validações, efetua as baixas com segurança
    for (const item of items) {
      const productId = item.productId;
      const soldQuantity = Number(item.quantity || 0);

      const [productRecord] = await db
        .select({
          isKit: products.isKit,
          useFixedStock: products.useFixedStock,
          stockCurrent: products.stockCurrent,
        })
        .from(products)
        .where(eq(products.id, productId));

      if (productRecord) {
        // Se for kit dinâmico, desconta em cascata nos filhos
        if (productRecord.isKit && !productRecord.useFixedStock) {
          await deductKitComponentsStock(productId, soldQuantity);
        }

        // Atualiza o estoque do item vendido (seja avulso ou kit de estoque fixo)
        const newStockCurrent = Math.max(0, (productRecord.stockCurrent || 0) - soldQuantity);

        await db
          .update(products)
          .set({ stockCurrent: newStockCurrent })
          .where(eq(products.id, productId));
      }
    }

    return NextResponse.json(
      { success: true, message: 'Pedido validado, processado e estoque baixado com sucesso!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao processar pedido e baixa de estoque:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o pedido.' }, { status: 500 });
  }
}