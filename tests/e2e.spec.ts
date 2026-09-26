import { test, expect } from '@playwright/test';

test('Fluxo principal da Melo Perfumaria', async ({ page }) => {
  // 1. Acessa o Dashboard
  await page.goto('http://localhost:3000/');
  await expect(page.locator('h1').first()).toContainText(/Economia Certa ERP/i);

  // 2. Vai diretamente para a página de Produtos
  await page.goto('http://localhost:3000/produtos');
  await expect(page).toHaveURL('http://localhost:3000/produtos');
  await expect(page.locator('body')).toContainText(/Produtos/i);

  // 3. Vai para o painel de Cotações e valida o primeiro elemento correspondente
  await page.goto('http://localhost:3000/cotacoes');
  await expect(page).toHaveURL('http://localhost:3000/cotacoes');
  await expect(page.locator('text=Nova Cotação').first()).toBeVisible();
});