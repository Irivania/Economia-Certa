import { test, expect } from '@playwright/test';

test('Fluxo principal da Melo Perfumaria', async ({ page }) => {
  // 1. Acessa o Dashboard
  await page.goto('http://localhost:3000/');
  await expect(page.locator('h1')).toContainText('Economia Certa ERP');

  // 2. Vai para a página de Produtos e verifica se carregou
  await page.click('text=Ver catálogo completo');
  await expect(page).toHaveURL('http://localhost:3000/produtos');
  await expect(page.locator('h1')).toContainText('Gestão de Produtos');

  // 3. Vai para o painel de Cotações
  await page.goto('http://localhost:3000/cotacoes');
  await expect(page.locator('h1')).toContainText('Painel de Cotações');
});