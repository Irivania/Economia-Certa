import { z } from "zod";

// Schema para a rota de resposta de cotação do fornecedor
export const submitQuotationResponseSchema = z.object({
  token: z.string().min(1, "Token de acesso é obrigatório."),
  prices: z.record(
    z.string(),
    z.number().nonnegative("O preço unitário não pode ser negativo."),
  ),
  outOfStock: z.record(z.string(), z.boolean()),
  observation: z.string().optional().default(""),
});

export type SubmitQuotationResponseInput = z.infer<
  typeof submitQuotationResponseSchema
>;
