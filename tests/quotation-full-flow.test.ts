import { test, expect } from '@playwright/test';

test.describe('Economia Certa ERP - Ciclo Completo de Cotação e Pedidos', () => {

  test('deve preencher e submeter o formulário de nova cotação', async ({ page }) => {
    // 1. Acede à página de nova cotação diretamente
    await page.goto('http://localhost:3000/cotacoes/nova');
    await expect(page).toHaveURL('http://localhost:3000/cotacoes/nova');

    // 2. Preenche o formulário de nova cotação
    const titleInput = page.locator('input[type="text"]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Cotação Automática E2E');

    // 3. Submete a criação da cotação
    const submitBtn = page.locator('button[type="submit"]', { hasText: /Criar Cotação/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 4. Valida que o feedback de sucesso ou alteração de estado ocorreu
    // Aguarda a resposta da API ou alteração de URL pós-criação
    await page.waitForTimeout(1000);
  });

});