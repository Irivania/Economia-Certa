import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { products, productCostHistory, productCompositions } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { calculateKitStock, calculateKitCost } from "@/lib/productComposition";
import { requireCompanySession } from "@/lib/authServer";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    let session;
    try {
      session = requireCompanySession(request);
    } catch {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedCompanyId = searchParams.get("companyId");
    if (requestedCompanyId && requestedCompanyId !== session.companyId) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    const companyId = session.companyId;

    const query = db.select().from(products).orderBy(asc(products.description));

    const rawItems = companyId
      ? await query.where(eq(products.companyId, companyId))
      : await query;

    // 💡 INTEGRAÇÃO HÍBRIDA DE KITS E ESTOQUE
    const itemsWithVirtualStock = await Promise.all(
      rawItems.map(async (prod) => {
        const comps = await db
          .select({ id: productCompositions.id })
          .from(productCompositions)
          .where(eq(productCompositions.productId, prod.id))
          .limit(1);

        const hasComponents = comps.length > 0;

        // Se for kit e NÃO usa estoque fixo, calcula pelo gargalo (dinâmico)
        if (hasComponents && !prod.useFixedStock) {
          const virtualStock = await calculateKitStock(prod.id);
          return {
            ...prod,
            stockCurrent: virtualStock,
            isKit: true,
          };
        }

        return {
          ...prod,
          isKit: hasComponents || prod.isKit,
        };
      }),
    );

    return NextResponse.json(itemsWithVirtualStock);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar produtos." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      code,
      description,
      brand,
      imageUrl,
      unit,
      boxQuantity,
      costPrice,
      lastPurchasePrice,
      salePrice,
      stockCurrent,
      stockMin,
      stockIdeal,
      stockMax,
      ncm,
      cest,
      classTrib, // 💡 Essencial para CBS / IBS (Reforma Tributária)
      anvisaRegistry,
      manufacturerName,
      weight,
      dimensions,
      supplierName,
      invoiceNumber,
      purchasedBy,
      components,
      useFixedStock,
    } = body;

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "A descrição do produto é obrigatória." },
        { status: 400 },
      );
    }

    const cleanEan = code ? String(code).trim() : null;
    const currentCompanyId = companyId ? String(companyId) : "";

    // 💡 HIGIENIZAÇÃO E NORMALIZAÇÃO FISCAL
    const cleanNcm = ncm ? String(ncm).trim().replace(/\D/g, "") : null;
    const cleanCest = cest ? String(cest).trim().replace(/\D/g, "") : null;
    const cleanClassTrib = classTrib
      ? String(classTrib).trim().toUpperCase()
      : null;

    if (cleanEan && currentCompanyId) {
      const [existingProduct] = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.companyId, currentCompanyId),
            eq(products.ean, cleanEan),
          ),
        );

      if (existingProduct) {
        return NextResponse.json(
          {
            error: `Já existe um produto cadastrado com o EAN "${cleanEan}": "${existingProduct.description}".`,
          },
          { status: 400 },
        );
      }
    }

    const newProductId = crypto.randomUUID();
    const hasComponents = Array.isArray(components) && components.length > 0;

    let finalCostPrice = costPrice ? String(costPrice) : null;

    await db.insert(products).values({
      id: newProductId,
      companyId: currentCompanyId,
      ean: cleanEan,
      description: String(description).trim().toUpperCase(),
      brand: brand ? String(brand).trim().toUpperCase() : null,
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
      unit: unit ? String(unit).trim().toUpperCase() : "UN",
      boxQuantity:
        boxQuantity !== undefined && boxQuantity !== ""
          ? Number(boxQuantity)
          : 1,
      costPrice: finalCostPrice,
      lastPurchasePrice: lastPurchasePrice ? String(lastPurchasePrice) : null,
      salePrice: salePrice ? String(salePrice) : null,
      stockCurrent:
        stockCurrent !== undefined && stockCurrent !== ""
          ? Number(stockCurrent)
          : 0,
      stockMin:
        stockMin !== undefined && stockMin !== "" ? Number(stockMin) : 0,
      stockIdeal:
        stockIdeal !== undefined && stockIdeal !== "" ? Number(stockIdeal) : 0,
      stockMax:
        stockMax !== undefined && stockMax !== "" ? Number(stockMax) : 0,
      ncm: cleanNcm,
      cest: cleanCest,
      classTrib: cleanClassTrib, // 💡 Gravado limpo e padronizado para apuração do IVA Dual
      anvisaRegistry: anvisaRegistry
        ? String(anvisaRegistry).trim().toUpperCase()
        : null,
      manufacturerName: manufacturerName
        ? String(manufacturerName).trim().toUpperCase()
        : null,
      weight: weight ? String(weight).trim() : null,
      dimensions: dimensions ? String(dimensions).trim().toUpperCase() : null,
      isKit: hasComponents,
      useFixedStock: Boolean(useFixedStock),
    });

    if (hasComponents) {
      const insertComps = components.map(
        (c: { componentProductId: string; quantity: number | string }) => ({
          productId: newProductId,
          componentProductId: c.componentProductId,
          quantity: String(c.quantity || 1),
        }),
      );
      await db.insert(productCompositions).values(insertComps);

      // Custo automático do kit
      if (!costPrice || Number(costPrice) === 0) {
        const calculatedCost = await calculateKitCost(newProductId);
        if (calculatedCost > 0) {
          await db
            .update(products)
            .set({ costPrice: String(calculatedCost) })
            .where(eq(products.id, newProductId));
          finalCostPrice = String(calculatedCost);
        }
      }
    }

    if (finalCostPrice && Number(finalCostPrice) > 0) {
      await db.insert(productCostHistory).values({
        id: crypto.randomUUID(),
        companyId: currentCompanyId,
        productId: newProductId,
        supplierName: supplierName
          ? String(supplierName).trim().toUpperCase()
          : manufacturerName
            ? String(manufacturerName).trim().toUpperCase()
            : "FORNECEDOR GERAL",
        invoiceNumber: invoiceNumber ? String(invoiceNumber).trim() : null,
        unitCost: String(finalCostPrice),
        quantity:
          stockCurrent !== undefined && stockCurrent !== ""
            ? String(stockCurrent)
            : "1",
        purchasedBy: purchasedBy ? String(purchasedBy).trim() : "Gestor / Loja",
      });
    }

    return NextResponse.json(
      { success: true, id: newProductId },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Erro detalhado ao cadastrar produto:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro interno ao cadastrar produto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      companyId,
      code,
      description,
      brand,
      imageUrl,
      unit,
      boxQuantity,
      costPrice,
      lastPurchasePrice,
      salePrice,
      stockCurrent,
      stockMin,
      stockIdeal,
      stockMax,
      ncm,
      cest,
      classTrib, // 💡 cClassTrib atualizado
      anvisaRegistry,
      manufacturerName,
      weight,
      dimensions,
      supplierName,
      invoiceNumber,
      purchasedBy,
      components,
      useFixedStock,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do produto não fornecido para atualização." },
        { status: 400 },
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "A descrição do produto é obrigatória." },
        { status: 400 },
      );
    }

    const [oldProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    const hasComponents = Array.isArray(components) && components.length > 0;

    // 💡 HIGIENIZAÇÃO E NORMALIZAÇÃO FISCAL NA EDIÇÃO
    const cleanNcm = ncm ? String(ncm).trim().replace(/\D/g, "") : null;
    const cleanCest = cest ? String(cest).trim().replace(/\D/g, "") : null;
    const cleanClassTrib = classTrib
      ? String(classTrib).trim().toUpperCase()
      : null;

    let finalCostPrice = costPrice ? String(costPrice) : null;

    await db
      .update(products)
      .set({
        ean: code ? String(code).trim() : null,
        description: String(description).trim().toUpperCase(),
        brand: brand ? String(brand).trim().toUpperCase() : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        unit: unit ? String(unit).trim().toUpperCase() : "UN",
        boxQuantity:
          boxQuantity !== undefined && boxQuantity !== ""
            ? Number(boxQuantity)
            : 1,
        costPrice: finalCostPrice,
        lastPurchasePrice: lastPurchasePrice ? String(lastPurchasePrice) : null,
        salePrice: salePrice ? String(salePrice) : null,
        stockCurrent:
          stockCurrent !== undefined && stockCurrent !== ""
            ? Number(stockCurrent)
            : 0,
        stockMin:
          stockMin !== undefined && stockMin !== "" ? Number(stockMin) : 0,
        stockIdeal:
          stockIdeal !== undefined && stockIdeal !== ""
            ? Number(stockIdeal)
            : 0,
        stockMax:
          stockMax !== undefined && stockMax !== "" ? Number(stockMax) : 0,
        ncm: cleanNcm,
        cest: cleanCest,
        classTrib: cleanClassTrib,
        anvisaRegistry: anvisaRegistry
          ? String(anvisaRegistry).trim().toUpperCase()
          : null,
        manufacturerName: manufacturerName
          ? String(manufacturerName).trim().toUpperCase()
          : null,
        weight: weight ? String(weight).trim() : null,
        dimensions: dimensions ? String(dimensions).trim().toUpperCase() : null,
        isKit: hasComponents,
        useFixedStock: Boolean(useFixedStock),
      })
      .where(eq(products.id, id));

    if (Array.isArray(components)) {
      await db
        .delete(productCompositions)
        .where(eq(productCompositions.productId, id));
      if (components.length > 0) {
        const insertComps = components.map(
          (c: { componentProductId: string; quantity: number | string }) => ({
            productId: id,
            componentProductId: c.componentProductId,
            quantity: String(c.quantity || 1),
          }),
        );
        await db.insert(productCompositions).values(insertComps);
      }
    }

    if (hasComponents && (!costPrice || Number(costPrice) === 0)) {
      const calculatedCost = await calculateKitCost(id);
      if (calculatedCost > 0) {
        await db
          .update(products)
          .set({ costPrice: String(calculatedCost) })
          .where(eq(products.id, id));
        finalCostPrice = String(calculatedCost);
      }
    }

    if (
      finalCostPrice &&
      oldProduct &&
      Number(finalCostPrice) !== Number(oldProduct.costPrice || 0)
    ) {
      await db.insert(productCostHistory).values({
        id: crypto.randomUUID(),
        companyId: companyId ? String(companyId) : oldProduct.companyId,
        productId: id,
        supplierName: supplierName
          ? String(supplierName).trim().toUpperCase()
          : "ATUALIZAÇÃO DE CUSTO",
        invoiceNumber: invoiceNumber ? String(invoiceNumber).trim() : null,
        unitCost: String(finalCostPrice),
        quantity: "1",
        purchasedBy: purchasedBy ? String(purchasedBy).trim() : "Gestor / Loja",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Erro detalhado ao atualizar produto:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro interno ao atualizar produto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do produto não fornecido." },
        { status: 400 },
      );
    }

    await db
      .delete(productCompositions)
      .where(eq(productCompositions.productId, id));
    await db
      .delete(productCompositions)
      .where(eq(productCompositions.componentProductId, id));
    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir produto." },
      { status: 500 },
    );
  }
}
