import { NextResponse } from 'next/server';
import { ImportsService } from '@/modules/imports/imports.service';
import { ProductsService } from '@/modules/products/products.service';

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
        const newProduct = await ProductsService.create({
          companyId, // Utiliza o ID dinâmico vindo da requisição
          description: item.description,
          unit: item.unit,
          internalCode: item.internalCode,
          ean: item.ean,
          brand: item.brand,
          category: item.category,
          boxQuantity: item.boxQuantity,
          costPrice: item.costPrice,
          salePrice: item.salePrice,
        });
        savedProducts.push(newProduct);
      } catch (dbError) {
        console.error('Erro ao salvar produto individual no banco:', dbError);
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