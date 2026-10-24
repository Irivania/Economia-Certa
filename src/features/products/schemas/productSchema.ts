import { z } from 'zod';

export const productSchema = z.object({
  companyId: z.string().uuid({ message: 'ID da empresa inválido.' }),
  
  code: z.string().trim().optional().transform((val) => (val === '' ? undefined : val)),
  
  description: z
    .string()
    .min(2, { message: 'A descrição deve ter pelo menos 2 caracteres.' })
    .transform((val) => val.trim().toUpperCase()),
    
  brand: z.string().trim().optional().transform((val) => (val === '' ? undefined : val)),
  
  category: z.string().trim().optional().transform((val) => (val === '' ? undefined : val)),
  
  costPrice: z.coerce
    .number({ message: 'O preço de custo deve ser um número válido.' })
    .min(0, { message: 'O preço de custo não pode ser negativo.' }),
    
  salePrice: z.coerce
    .number({ message: 'O preço de venda deve ser um número válido.' })
    .min(0, { message: 'O preço de venda não pode ser negativo.' }),
    
  ncm: z.string().trim().optional().transform((val) => (val === '' ? undefined : val)),
  
  cest: z.string().trim().optional().transform((val) => (val === '' ? undefined : val)),
  
  origin: z.string().default('0'),
  
  unit: z
    .string()
    .min(1, { message: 'A unidade é obrigatória.' })
    .default('UN')
    .transform((val) => val.trim().toUpperCase()),
    
  boxQuantity: z.coerce
    .number()
    .int()
    .positive({ message: 'A quantidade na caixa deve ser maior que zero.' })
    .default(1),
});

export type ProductInput = z.infer<typeof productSchema>;