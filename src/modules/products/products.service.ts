import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { uppercaseText } from '@/lib/text';

export const createProductSchema = z.object({
  companyId: z.string().uuid('ID da empresa inválido.'),
  ean: z.string().optional(),
  description: z.string().min(2, 'A descrição do produto é obrigatória.').transform((val) => uppercaseText(val.trim())),
  brand: z.string().optional().transform((val) => val ? val.trim().toUpperCase() : undefined),
  category: z.string().optional().transform((val) => val ? val.trim().toUpperCase() : undefined),
  unit: z.string().min(1, 'A unidade de medida é obrigatória (ex: UN, CX).').transform((val) => val.trim().toUpperCase()),
  boxQuantity: z.number().int().positive('A quantidade por caixa deve ser maior que zero.').default(1),
  costPrice: z.string().optional(),
  salePrice: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export class ProductsService {
  /**
   * Cadastra um novo produto para a empresa garantindo isolamento multi-tenant e padronização em maiúsculas.
   */
  static async create(data: CreateProductInput) {
    const validatedData = createProductSchema.parse(data);

    const [newProduct] = await db
      .insert(products)
      .values({
        id: crypto.randomUUID(),
        companyId: validatedData.companyId,
        ean: validatedData.ean ? validatedData.ean.trim() : null,
        description: validatedData.description,
        brand: validatedData.brand || null,
        category: validatedData.category || null,
        unit: validatedData.unit,
        boxQuantity: validatedData.boxQuantity ?? 1,
        costPrice: validatedData.costPrice || null,
        salePrice: validatedData.salePrice || null,
      })
      .returning();

    return newProduct;
  }

  /**
   * Lista todos os produtos de uma empresa específica (Multi-tenant).
   */
  static async findByCompany(companyId: string) {
    return await db.query.products.findMany({
      where: eq(products.companyId, companyId),
    });
  }
}