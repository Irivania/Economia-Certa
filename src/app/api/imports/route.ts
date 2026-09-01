import { NextResponse } from 'next/server';
import { ImportsService } from '@/modules/imports/imports.service';
import { ProductsService } from '@/modules/products/products.service';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('companyId') as string;

    if (!companyId) {
      return NextResponse.json({ error: 'O ID da empresa (companyId) é obrigatório.' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const importResult = ImportsService.processSpreadsheet(buffer);

    const savedProducts = [];
    for (const item of importResult.successfulImports) {
      try {
        let existingProduct = null;

        if (item.ean) {
          const [foundByEan] = await db
            .select()
            .from(products)
            .where(and(eq(products.companyId, companyId), eq(products.ean, item.ean)));
          existingProduct = foundByEan;
        }

        if (!existingProduct && item.description) {
          const [foundByDesc] = await db
            .select()
            .from(products)
            .where(and(eq(products.companyId, companyId), eq(products.description, item.description)));
          existingProduct = foundByDesc;
        }

        let savedItem;

        if (existingProduct) {
          const [updated] = await db
            .update(products)
            .set({
              unit: item.unit || existingProduct.unit,
              ean: item.ean || existingProduct.ean,
              brand: item.brand || existingProduct.brand,
              category: item.category || existingProduct.category,
              boxQuantity: item.boxQuantity ?? existingProduct.boxQuantity,
              costPrice: item.costPrice || existingProduct.costPrice,
              salePrice: item.salePrice || existingProduct.salePrice,
            })
            .where(eq(products.id, existingProduct.id))
            .returning();
          
          savedItem = updated;
        } else {
          const newProduct = await ProductsService.create({
            companyId,
            description: item.description,
            unit: item.unit,
            ean: item.ean,
            brand: item.brand,
            category: item.category,
            boxQuantity: item.boxQuantity,
            costPrice: item.costPrice,
            salePrice: item.salePrice,
          });
          savedItem = newProduct;
        }

        savedProducts.push(savedItem);
      } catch (dbError) {
        console.error('Erro ao salvar/atualizar produto individual no banco:', dbError);
      }
    }

    return NextResponse.json({
      ...importResult,
      savedToDatabaseCount: savedProducts.length,
    });
  } catch (error) {
    console.error('Erro na importação:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o arquivo.' }, { status: 500 });
  }
}