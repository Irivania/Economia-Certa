import { test, expect } from '@playwright/test';

test.describe('Economia Certa ERP - Fluxo de Cotações', () => {
  
  test('deve navegar para a listagem de cotações e aceder à página de nova cotação', async ({ page }) => {
    // 1. Acede à página principal de cotações
    await page.goto('http://localhost:3000/cotacoes');

    // 2. Verifica se o cabeçalho principal está visível
    await expect(page.locator('h1').first()).toContainText(/Cotações/i);

    // 3. Clica no botão para criar nova cotação
    const novaCotacaoBtn = page.locator('text=Nova Cotação');
    await expect(novaCotacaoBtn).toBeVisible();
    await novaCotacaoBtn.click();

    // 4. Valida se a rota mudou corretamente para /cotacoes/nova
    await expect(page).toHaveURL('http://localhost:3000/cotacoes/nova');

    // 5. Valida se o título da página de criação está correto conforme nosso design system
    await expect(page.locator('h1').first()).toContainText(/Monte uma solicitação de preços/i);
  });

  test('deve testar a interatividade da barra de pesquisa na tabela de cotações', async ({ page }) => {
    // 1. Vai para a listagem
    await page.goto('http://localhost:3000/cotacoes');

    // 2. Procura pelo campo de busca se existir
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Setembro');
      await expect(searchInput).toHaveValue('SETEMBRO'); // Devido ao uppercase automático da nossa lib de texto
    }
  });

});