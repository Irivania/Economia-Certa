import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema de validação usando Zod para criação de empresas
export const createCompanySchema = z.object({
  name: z.string().min(2, 'O nome da empresa deve ter pelo menos 2 caracteres.'),
  document: z.string().min(11, 'CNPJ/Documento inválido.').max(18, 'CNPJ inválido.'),
  type: z.enum(['STORE', 'SUPPLIER']),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export class CompaniesService {
  /**
   * Cria uma nova empresa (Loja ou Fornecedor) no banco de dados.
   */
  static async create(data: CreateCompanyInput) {
    const validatedData = createCompanySchema.parse(data);

    // Verifica se já existe empresa com o mesmo documento (CNPJ)
    const existing = await db.query.companies.findFirst({
      where: eq(companies.document, validatedData.document),
    });

    if (existing) {
      throw new Error('Já existe uma empresa cadastrada com este documento.');
    }

    const [newCompany] = await db
      .insert(companies)
      .values({
        name: validatedData.name,
        document: validatedData.document,
        type: validatedData.type,
      })
      .returning();

    return newCompany;
  }

  /**
   * Busca uma empresa pelo ID técnico (UUID).
   */
  static async findById(id: string) {
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, id),
    });

    if (!company) {
      throw new Error('Empresa não encontrada.');
    }

    return company;
  }
}