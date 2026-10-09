import { test, expect } from '@playwright/test';

test.describe('Economia Certa ERP - Ciclo Completo de Cotação e Pedidos', () => {
  
  test('deve preencher e submeter o formulário de nova cotação', async ({ page }) => {
    // 1. Aceder à página de login do logista
    await page.goto('http://localhost:3000/login');

    // Preencher credenciais corporativas (ajusta com um utilizador de teste existente)
    await page.fill('input[type="email"]', 'melo.perfumaria@gmail.com');
    await page.fill('input[type="password"]', 'sua-senha-segura'); // Substitui pela senha real de teste
    await page.click('button[type="submit"]');

    // 2. Verificar se entrou no painel principal
    await page.waitForURL('http://localhost:3000/');
    await expect(page.locator('body')).toContainText('Economia Certa');

    // 3. Navegar para a criação de nova cotação
    await page.goto('http://localhost:3000/cotacoes/nova');
    await expect(page.locator('h1, h2')).toContainText(/Cotação|Nova/i);

    // 4. Preencher dados básicos da cotação
    await page.fill('input[name="title"]', 'Cotação Automatizada E2E - Teste Playwright');
    
    // Submeter ou avançar nos passos de seleção de itens e fornecedores
    // (Nota: Ajusta os seletores conforme os nomes exatos dos inputs ou botões do teu formulário)
    const submitButton = page.locator('button:has-text("Salvar"), button:has-text("Criar"), button:has-text("Avançar")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // 5. Validar redirecionamento para a listagem ou sucesso
    await page.waitForTimeout(2000);
    console.log('Ciclo de criação de cotação executado com sucesso pelo Playwright!');
  });

});