import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const createProductSchema = z.object({
  companyId: z.string().uuid('ID da empresa inválido.'),
  internalCode: z.string().optional(),
  ean: z.string().optional(),
  description: z.string().min(2, 'A descrição do produto é obrigatória.'),
  brand: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, 'A unidade de medida é obrigatória (ex: UN, CX).'),
  boxQuantity: z.number().int().positive('A quantidade por caixa deve ser maior que zero.').default(1),
  costPrice: z.string().optional(),
  salePrice: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export class ProductsService {
  /**
   * Cadastra um novo produto para a empresa garantindo isolamento multi-tenant.
   */
  static async create(data: CreateProductInput) {
    const validatedData = createProductSchema.parse(data);

    const [newProduct] = await db
      .insert(products)
      .values({
        companyId: validatedData.companyId,
        internalCode: validatedData.internalCode,
        ean: validatedData.ean,
        description: validatedData.description,
        brand: validatedData.brand,
        category: validatedData.category,
        unit: validatedData.unit,
        boxQuantity: validatedData.boxQuantity ?? 1,
        costPrice: validatedData.costPrice,
        salePrice: validatedData.salePrice,
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