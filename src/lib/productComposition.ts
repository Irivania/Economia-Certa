import { db } from '@/db/db';
import { productCompositions, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Calcula o estoque disponível de um kit com base no estoque dos seus componentes (gargalo).
 * Se um item componente tiver 0 unidades, o kit fica com 0 unidades disponíveis.
 */
export async function calculateKitStock(kitProductId: string): Promise<number> {
  const components = await db
    .select({
      componentId: productCompositions.componentProductId,
      requiredQty: productCompositions.quantity,
      stockCurrent: products.stockCurrent,
    })
    .from(productCompositions)
    .innerJoin(products, eq(products.id, productCompositions.componentProductId))
    .where(eq(productCompositions.productId, kitProductId));

  if (components.length === 0) {
    return 0; // Se não tem composição cadastrada, o estoque virtual é 0
  }

  let maxPossibleKits = Infinity;

  for (const comp of components) {
    const availableStock = comp.stockCurrent || 0;
    const requiredQty = Number(comp.requiredQty) || 1;
    const possibleFromThisComponent = Math.floor(availableStock / requiredQty);

    if (possibleFromThisComponent < maxPossibleKits) {
      maxPossibleKits = possibleFromThisComponent;
    }
  }

  return maxPossibleKits === Infinity ? 0 : maxPossibleKits;
}

/**
 * 💡 NOVO: Calcula o custo total de um kit com base no custo unitário dos seus componentes.
 * Multiplica a quantidade necessária de cada filho pelo seu respetivo preço de custo.
 */
export async function calculateKitCost(kitProductId: string): Promise<number> {
  const components = await db
    .select({
      requiredQty: productCompositions.quantity,
      componentCost: products.costPrice,
    })
    .from(productCompositions)
    .innerJoin(products, eq(products.id, productCompositions.componentProductId))
    .where(eq(productCompositions.productId, kitProductId));

  if (components.length === 0) {
    return 0;
  }

  let totalCost = 0;
  for (const comp of components) {
    const requiredQty = Number(comp.requiredQty) || 1;
    const cost = Number(comp.componentCost || 0);
    totalCost += requiredQty * cost;
  }

  return Number(totalCost.toFixed(2));
}

/**
 * Processa a baixa de estoque em cascata quando um kit é vendido.
 * Desconta dos itens individuais (componentes) a quantidade proporcional vendida.
 */
export async function deductKitComponentsStock(
  kitProductId: string,
  soldKitQuantity: number
) {
  const components = await db
    .select()
    .from(productCompositions)
    .where(eq(productCompositions.productId, kitProductId));

  for (const comp of components) {
    const requiredQty = Number(comp.quantity) || 1;
    const totalDeduction = requiredQty * soldKitQuantity;

    // Busca o estoque atual do item individual
    const [item] = await db
      .select({ stockCurrent: products.stockCurrent })
      .from(products)
      .where(eq(products.id, comp.componentProductId))
      .limit(1);

    if (item) {
      const newStock = Math.max(0, item.stockCurrent - totalDeduction);

      // Atualiza o estoque do item individual no banco de dados
      await db
        .update(products)
        .set({ stockCurrent: newStock })
        .where(eq(products.id, comp.componentProductId));
    }
  }
}