import { z } from 'zod';

export const productSchema = z.object({
  companyId: z.string().uuid({ message: 'ID da empresa inválido.' }),
  code: z.string().optional(),
  description: z.string().min(2, { message: 'A descrição deve ter pelo menos 2 caracteres.' }).transform((val) => val.trim().toUpperCase()),
  brand: z.string().optional(),
  category: z.string().optional(),
  costPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'O preço de custo deve ser um número válido.',
  }),
  salePrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'O preço de venda deve ser um número válido.',
  }),
  ncm: z.string().optional(),
  cest: z.string().optional(),
  origin: z.string().default('0'),
  unit: z.string().default('UN'),
  boxQuantity: z.number().default(1),
});

export type ProductInput = z.infer<typeof productSchema>;
