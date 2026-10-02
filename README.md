# Economia Certa ERP & B2B Portal

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green?style=flat-square)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Economia Certa** é um ERP corporativo de alta performance e um ecossistema B2B integrado para o setor varejista e de perfumaria. O sistema resolve a fricção operacional na gestão de inventário, precificação inteligente, importação em massa e otimização de cotações comerciais entre lojistas e fornecedores.

---

## 🏗️ Arquitetura e Decisões de Engenharia (ADR)

O projeto foi concebido seguindo princípios rigorosos de **Clean Architecture** e separação de concerns. A estrutura de diretórios foi blindada para garantir escalabilidade horizontal e manutenibilidade por domínios de negócio.

```text
src/
├── app/                  # Next.js App Router (Páginas e API Endpoints)
│   ├── api/              # Rotas Server-Side RESTful com validação Zod
│   ├── portal/           # Portal B2B de alta performance para Fornecedores
│   └── ...               # Módulos gerenciais do ERP (Produtos, Cotações, etc.)
├── components/           # Design System & Componentes de UI Reutilizáveis
├── db/                   # Camada de Persistência (Schema Drizzle, Client & Migrations)
├── modules/              # Domínios isolados de negócio (Business Logic Layer)
├── types/                # Contratos de Tipagem Global & Schemas Zod
└── utils/                # Funções Puras e Auxiliares (Cálculos Fiscais & Formatação)

Pilares Técnicos:Multi-tenancy Nativo: Isolamento rigoroso de dados corporativos controlado via companyId em todas as transações e consultas ao banco.Segurança e Validação em Runtime: Contratos rigorosos utilizando Zod para impedir injeção de dados inválidos nas rotas de API.DX (Developer Experience) & Type Safety: Tipagem ponta a ponta (End-to-End Type Safety) ligando o esquema relacional do Drizzle ORM diretamente aos componentes React.🚀 Funcionalidades de Nível Enterprise1. Gestão de Catálogo e Estoque PreditivoCadastro paramétrico de produtos com suporte a SKU, EAN-13, NCM/CEST e múltiplos custos.Gestão automatizada de estoques (atual, mínimo, ideal e máximo) com alertas de desabastecimento.Algoritmo de precificação dinâmica baseado em margem alvo e custos operacionais.2. Importação Inteligente de Dados em Lote (ETL Leve)Parser integrado para planilhas corporativas (.xls, .xlsx) via xlsx.Normalização de dados, comparação de chaves únicas por EAN e prevenção de duplicidade de catálogo em massa.3. Portal B2B de Cotações com Roteamento por Token (Magic Link)Fluxo dinâmico onde lojistas publicam cotações e fornecedores recebem links seguros baseados em tokens únicos (/portal/cotacao/[token]).Tabela Interativa de Alta Performance: Navegação por teclado otimizada (Enter automático entre inputs de preço e marcação rápida de produtos indisponíveis).Cronómetro Regressivo em Tempo Real: Sincronização e contagem decrescente baseada no prazo de fechamento do lojista, criando urgência comercial.4. Inteligência de Compras e Relatórios de EconomiaCruzamento automatizado do menor preço ofertado por diferentes fornecedores (Mix Mais Barato).Geração de relatórios analíticos comparando o custo original versus o custo otimizado pós-cotação.🧪 Qualidade de Software e TestesO repositório conta com uma suíte de testes automatizados para mitigar regressões e garantir estabilidade em ambiente de produção:Testes E2E (Playwright): Simulação de jornadas críticas de utilizador e auditoria de segurança em endpoints de API.Testes Unitários (Vitest): Validação de regras de negócio isoladas, cálculos fiscais e transformações de dados.🛠️ Stack TecnológicoCamadaTecnologia / FerramentaFramework WebNext.js 16 (App Router, Server/Client Components)Biblioteca UIReact 19, Tailwind CSS 4LinguagemTypeScript (Strict Mode)Banco de DadosPostgreSQL 14+ORM & MigrationsDrizzle ORM & Drizzle KitValidaçãoZodProcessamento de ArquivosSheetJS (xlsx)TestesPlaywright (E2E) & Vitest (Unit)⚙️ Configuração e Execução LocalPré-requisitosCertifique-se de ter instalado na sua máquina:Node.js 20+PostgreSQL configurado e ativo1. Clonar o repositório e instalar dependênciasBashgit clone [https://github.com/SEU_USUARIO/economia-certa-erp.git](https://github.com/SEU_USUARIO/economia-certa-erp.git)
cd economia-certa-erp
npm install
2. Configurar Variáveis de AmbienteCrie um ficheiro .env.local na raiz do projeto baseado no exemplo abaixo:Snippet de códigoDATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/economia_certa"
NEXT_PUBLIC_DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/economia_certa"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
3. Executar Migrações do Banco de DadosBashnpx drizzle-kit push
4. Iniciar o Servidor de DesenvolvimentoBashnpm run dev
A aplicação estará disponível em http://localhost:3000.🔍 Executando os Testes AutomatizadosBash# Executar testes unitários (Vitest)
npm run test

# Executar testes End-to-End (Playwright)
npx playwright test
📄 LicençaDistribuído sob a licença MIT. Veja LICENSE para mais informações.

---

### Por que este README destaca o seu perfil técnico:
1. **Badges Tecnológicos:** Demonstra instantaneamente o domínio do stack moderno.
2. **Decisões de Engenharia (ADR):** Mostra que você não apenas escreveu código, mas pensou na arquitetura (Multi-tenancy, Type Safety, Zod).
3. **Destaque ao Módulo B2B:** Valoriza a complexidade do portal de fornecedores com tokens e cronómetros, que diferencia o seu sistema de um ERP comum de CRUD.
4. **Instruções Limpas:** Facilita a vida de qualquer recrutador ou avaliador técnico que queira testar a aplicação localmente em menos de 2 minutos.
