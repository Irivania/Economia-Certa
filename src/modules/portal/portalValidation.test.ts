import { describe, it, expect } from "vitest";
import { submitQuotationResponseSchema } from "./portalValidation";

describe("Validação Zod & Regras de Negócio - Portal B2B", () => {
  it("deve validar com sucesso um payload de resposta de cotação válido", () => {
    const validPayload = {
      token: "magic-token-123-abc",
      prices: { "prod-1": 15.5, "prod-2": 100.0 },
      outOfStock: { "prod-1": false, "prod-2": false },
      observation: "Tudo de acordo com o pedido.",
    };

    const result = submitQuotationResponseSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.token).toBe("magic-token-123-abc");
      expect(result.data.prices["prod-1"]).toBe(15.5);
    }
  });

  it("deve rejeitar a submissão se o preço unitário for negativo", () => {
    const invalidPayload = {
      token: "magic-token-123-abc",
      prices: { "prod-1": -5.0 }, // Preço inválido (negativo)
      outOfStock: { "prod-1": false },
    };

    const result = submitQuotationResponseSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toContain(
        "O preço unitário não pode ser negativo",
      );
    }
  });

  it("deve rejeitar se o token de acesso estiver ausente ou vazio", () => {
    const invalidPayload = {
      token: "", // Token vazio
      prices: { "prod-1": 10.0 },
      outOfStock: { "prod-1": false },
    };

    const result = submitQuotationResponseSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
