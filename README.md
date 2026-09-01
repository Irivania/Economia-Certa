# Economia Certa ERP

Sistema de gestão para comércio e perfumaria com foco em controle de estoque, precificação inteligente, importação em lote de planilhas, gestão de fornecedores e análise de economia por cotação.

O projeto foi estruturado como uma aplicação web moderna em Next.js para centralizar o gerenciamento operacional de uma empresa varejista e distribuída, com forte foco em produtividade de compras, organização de catálogo e apoio à tomada de decisão financeira.

## Visão Geral

O Economia Certa ERP permite que uma empresa acompanhe:

- cadastro e manutenção de produtos;
- controle de estoque mínimo, ideal e máximo;
- importação de listas externas e padronização de dados;
- comparação de preços por fornecedor;
- geração de cotações e itens vinculados;
- relatório de economia com cálculo de diferença entre custo atual e oferta;
- gestão de categorias, marcas e fornecedores;
- operação multi-tenant por `companyId`.

---

## Stack Tecnológico

A aplicação utiliza uma stack moderna para web, backend e automação:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- Drizzle Kit
- Playwright
- Vitest
- Zod
- XLSX
- Node.js
- pg (driver PostgreSQL)

### Visão de uso por camada

- Frontend: Next.js + React + Tailwind CSS
- API: rotas server-side do App Router do Next.js
- Banco de dados: PostgreSQL com Drizzle ORM
- Validação: Zod
- Importação de planilhas: XLSX
- Testes E2E: Playwright
- Testes unitários: Vitest

---

## Arquitetura e Estrutura de Pastas

A organização do repositório foi pensada para separar responsabilidades por domínio e por camada funcional.

```text
Economia Certa/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── brands/
│   │   │   ├── categories/
│   │   │   ├── imports/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── quotations/
│   │   │   ├── reports/
│   │   │   └── suppliers/
│   │   ├── categorias/
│   │   ├── cotacoes/
│   │   ├── fornecedores/
│   │   ├── importar/
│   │   ├── marcas/
│   │   ├── produtos/
│   │   ├── relatorios/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ProductForm.tsx
│   │   ├── ProductImportModal.tsx
│   │   ├── ProductTable.tsx
│   │   ├── QuotationCard.tsx
│   │   ├── QuotationForm.tsx
│   │   └── QuotationItemForm.tsx
│   ├── db/
│   │   ├── schema.ts
│   │   ├── db.ts
│   │   └── migrations/
│   ├── modules/
│   │   ├── companies/
│   │   ├── imports/
│   │   ├── products/
│   │   ├── quotations/
│   │   ├── representatives/
│   │   ├── suppliers/
│   │   ├── users/
│   │   └── ...
│   ├── types/
│   │   └── productSchema.ts
│   ├── utils/
│   │   └── fiscal.ts
│   └── lib/
├── tests/
│   ├── api-security.spec.ts
│   └── e2e.spec.ts
├── drizzle.config.ts
├── playwright.config.ts
├── vitest.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.example (opcional/gerado localmente)
├── README.md
└── public/
```

### Como a arquitetura funciona

- `src/app` concentra páginas públicas/rotas do App Router e endpoints de API.
- `src/components` reúne formulários, tabelas, modais e cards reutilizáveis.
- `src/db` define o schema SQL do Drizzle e a conexão com PostgreSQL.
- `src/modules` encapsula a regra de negócio por domínio (produtos, importação, cotações, usuários, etc.).
- `src/types` centraliza validações e contratos de entrada.
- `src/utils` contém helpers utilitários, como cálculos fiscais.
- `tests` guarda testes de segurança e fluxo end-to-end.

> O sistema também usa um padrão de isolamento por empresa baseado em `companyId`, presente em rotas e consultas ao banco.

---

## Funcionalidades Principais

### 1. Gestão de produtos e estoques

- cadastro de produtos com descrição, marca, categoria, custo e preço de venda;
- controle de estoque atual, mínimo, ideal e máximo;
- cálculo de margem e geração automática de preço de venda;
- suporte a códigos internos, EAN e informações fiscais como NCM/CEST;
- visualização em tabelas com filtros por categoria e marca.

### 2. Importação inteligente de dados em lote

- leitura de planilhas externas em XLS/XLSX;
- processamento de listas de produtos para padronização;
- comparação e atualização de itens já existentes no banco;
- prevenção de duplicidade por `ean` ou descrição;
- registro de produtos em massa com menor esforço operacional.

### 3. Cotações e comparação de fornecedores

- criação de cotações com itens e quantidades;
- inclusão de fornecedores por item;
- análise de preço ofertado versus custo atual;
- geração de relatório de economia e percentual de redução;
- organização de decisões de compra baseada em dados reais.

### 4. Relatórios e analise de economia

- cálculo de custo original vs. custo otimizado;
- comparação de valor por produto e por cotação;
- resumo financeiro com total de economia e percentual;
- visão orientada à decisão para compras e precificação.

### 5. Segurança e qualidade de software

- validação de entrada com Zod em rotas críticas;
- respostas padronizadas para erros de requisição;
- testes automatizados de API para validar falhas e respostas esperadas;
- testes E2E cobrindo fluxo principal da aplicação.

---

## Requisitos de Ambiente

Antes de iniciar o projeto, certifique-se de ter instalado:

- Node.js 20+ (recomendado)
- npm ou outro gerenciador de pacotes compatível
- PostgreSQL 14+ ou instância equivalente
- acesso a um banco PostgreSQL local ou remoto
- editor de código como VS Code

### Dependências do projeto

O repositório inclui as dependências principais no arquivo `package.json`, incluindo:

- `next`
- `react`
- `react-dom`
- `drizzle-orm`
- `pg`
- `zod`
- `xlsx`
- `@playwright/test`
- `vitest`
- `tailwindcss`

---

## Variáveis de Ambiente (.env)

Crie um arquivo `.env.local` na raiz do projeto com as variáveis abaixo:

```env
DATABASE_URL="postgresql://postgres:SEU_PASSWORD@localhost:5432/economia_certa"
NEXT_PUBLIC_DATABASE_URL="postgresql://postgres:SEU_PASSWORD@localhost:5432/economia_certa"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Observações

- `DATABASE_URL` é a principal variável usada pela conexão do Drizzle.
- O projeto também faz fallback para `NEXT_PUBLIC_DATABASE_URL` em alguns pontos de configuração.
- Ajuste a string de conexão conforme o host, usuário e banco do seu ambiente local ou de produção.

---

## Como Executar o Projeto

A seguir, os passos para rodar o sistema localmente.

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o banco de dados

Antes de iniciar a aplicação, configure o PostgreSQL e garanta que a base exista.

Em seguida, execute as migrações/atualização do schema com o Drizzle:

```bash
npx drizzle-kit push
```

> Caso o banco ainda não exista, crie-o manualmente antes do comando acima.

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação fica disponível em:

```text
http://localhost:3000
```

### 4. Executar testes automatizados

#### Testes E2E com Playwright

```bash
npx playwright test
```

Os testes cobrem navegação e validação de fluxos principais, além de cenários de segurança de APIs.

#### Testes unitários com Vitest

```bash
npx vitest
```

---

## Padrões de Desenvolvimento Observados

O projeto demonstra uma implementação prática de arquitetura moderna para ERP web:

- separação clara entre camadas de interface, aplicação e dados;
- uso intensivo de componentes reutilizáveis no frontend;
- modelagem de dados por domínio com Drizzle;
- uso de rotas de API em Next.js para operações CRUD e relatórios;
- foco em eficiência operacional e decisões baseadas em dados;
- suporte a múltiplas empresas por `companyId`.

---

## Fluxo Principal da Aplicação

1. Usuário acessa o dashboard inicial.
2. Navega para produtos, cotações e relatórios.
3. Registra ou importa produtos em lote.
4. Analisa estoque crítico e necessidade de reposição.
5. Cria cotações com fornecedores e itens desejados.
6. Compara custos e calcula possíveis economias.
7. Gera relatórios para apoiar compras estratégicas.

---

## Conclusão

O Economia Certa ERP é uma solução de gestão operacional e financeira para o comércio, com destaque para:

- controle de catálogo e estoque;
- importação eficiente de dados externos;
- precificação com margem e análise econômica;
- geração de cotações e relatórios de economia;
- automação de testes e qualidade de processo.

Este repositório representa uma base sólida para evolução contínua do sistema, com suporte à expansão de novos módulos, integrações e recursos analíticos.

---

## Informações Adicionais

Para desenvolvimento local, é recomendado:

- manter um ambiente PostgreSQL separado por projeto;
- usar `.env.local` para segredos e configurações locais;
- executar testes após alterações relevantes em rotas, schema ou fluxo de importação;
- revisar `src/db/schema.ts` e as rotas em `src/app/api` ao alterar estruturas de dados ou regras de negócio.
