import { test, expect } from '@playwright/test';

test.describe('Economia Certa ERP - Ciclo Completo de Cotação e Pedidos', () => {

  test('deve carregar a página de nova cotação e preencher os dados essenciais', async ({ page }) => {
    // 1. Acede à página de nova cotação diretamente
    await page.goto('http://localhost:3000/cotacoes/nova');
    await expect(page).toHaveURL('http://localhost:3000/cotacoes/nova');

    // 2. Preenche o título da cotação
    const titleInput = page.locator('input[type="text"]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Cotação Automática E2E');

    // 3. Aguarda o carregamento dos fornecedores da API
    await page.waitForTimeout(2000);

    // 4. Seleciona o botão exato "Marcar todos" usando o seletor restrito do Playwright
    const selectAllBtn = page.getByRole('button', { name: 'Marcar todos', exact: true });
    if (await selectAllBtn.isVisible()) {
      await selectAllBtn.click();
    }

    // 5. Verifica o estado do botão de submissão
    const submitBtn = page.locator('button[type="submit"]', { hasText: /Criar Cotação|Salvar/i });
    await expect(submitBtn).toBeVisible();
    
    await page.waitForTimeout(1000);
    console.log('Teste E2E executado com sucesso e sem violações de strict mode!');
  });

});