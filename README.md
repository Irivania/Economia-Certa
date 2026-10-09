# Economia Certa

#### Video Demo: <URL_DO_VIDEO_AQUI>

#### Description:

O Economia Certa é uma aplicação web para gestão de compras e cotações B2B,
desenvolvida como projeto final para o CS50. O sistema foi pensado para
resolver um problema comum de lojas que precisam consultar vários
representantes e distribuidoras antes de realizar uma compra. Em vez de
controlar propostas por mensagens, planilhas e cálculos manuais, o lojista
pode cadastrar produtos, montar uma cotação, encaminhá-la a fornecedores,
comparar respostas e transformar a escolha final em pedidos separados.

O projeto possui dois ambientes principais. No ambiente do lojista, o usuário
gerencia empresa, usuários, categorias, produtos, estoque, preços e cotações.
No portal B2B, o representante acessa as cotações recebidas, pode representar
mais de uma distribuidora e responde cada cotação em nome da empresa correta.
O lojista também pode escolher o menor preço automaticamente, comprar todos os
itens de uma distribuidora, selecionar fornecedor produto a produto ou marcar
um item como não comprado. Ao final, o sistema apresenta um resumo com
produtos, quantidades, preços, subtotais, totais por distribuidora, itens não
atendidos e motivos das decisões.

Uma decisão importante de projeto foi não usar apenas o identificador do
representante para separar respostas. Um mesmo representante pode trabalhar
com várias distribuidoras independentes. Por isso, cada participação em uma
cotação recebe um `quotationSupplierId` próprio e pode apontar para um
`brandId` específico. Preços, observações, status, tokens de acesso e pedidos
utilizam esse vínculo individual. Assim, uma resposta destinada à Distribuidora
1 não aparece para a Distribuidora 2, mesmo quando ambas pertencem ao mesmo
representante.

O vídeo da demonstração deve apresentar o fluxo completo: login, cadastro de
produtos, criação de uma cotação, escolha das distribuidoras, resposta no
portal, comparação de preços, geração de pedidos separados e encerramento
interno pelo representante. Antes de enviar o projeto, substitua
`<URL_DO_VIDEO_AQUI>` pela URL real do vídeo solicitado pelo CS50.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-C5F74F?style=for-the-badge)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-F7DF1E?style=for-the-badge)](LICENSE)

> **Economia Certa ERP** é um painel gerencial inteligente para controlo de compras em tempo real, gestão de catálogo, acompanhamento de stock, cotações automatizadas com distribuidores e optimização de preços para operações de retalho.

O sistema liga lojistas, representantes e empresas fornecedoras num fluxo B2B rastreável: o lojista cria uma cotação, os fornecedores respondem de forma isolada, o sistema compara propostas, consolida os pedidos por fornecedor e acompanha o ciclo até ao recebimento e encerramento.

---

## Índice

- [Visão geral](#visão-geral)
- [Principais capacidades](#principais-capacidades)
- [Arquitetura da solução](#arquitetura-da-solução)
- [Modelo multi-tenant](#modelo-multi-tenant)
- [Arquitetura da base de dados](#arquitetura-da-base-de-dados)
- [Fluxo de cotações e pedidos](#fluxo-de-cotações-e-pedidos)
- [Arquivos principais](#arquivos-principais)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e configuração](#instalação-e-configuração)
- [Execução](#execução)
- [Testes e qualidade](#testes-e-qualidade)
- [Migrações da base de dados](#migrações-da-base-de-dados)
- [Integrações externas](#integrações-externas)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estado do projecto](#estado-do-projecto)
- [Licença](#licença)

---

## Visão geral

### Problema de negócio

Operações de compra no retalho normalmente dependem de mensagens dispersas, planilhas e comparações manuais. O Economia Certa centraliza esse processo numa única experiência:

1. O lojista mantém produtos, preços, stock e dados cadastrais.
2. Uma cotação é enviada a um ou mais fornecedores.
3. Cada fornecedor responde apenas pela empresa que representa.
4. O lojista compara preços, disponibilidade, condições e observações.
5. Os itens escolhidos são agrupados em pedidos independentes por fornecedor.
6. Representante e lojista acompanham o despacho, recebimento e encerramento.
7. O histórico e os eventos da negociação permanecem documentados.

### Objectivos técnicos

- Isolar dados por empresa e por fornecedor.
- Evitar mistura de propostas entre marcas representadas pelo mesmo representante.
- Preservar um snapshot comercial do pedido no momento da decisão.
- Garantir transições de estado previsíveis e auditáveis.
- Reduzir trabalho manual no processo de compra.
- Manter tipagem forte entre frontend, API e persistência.

---

## Principais capacidades

### Dashboard executivo

Apresenta uma visão operacional da empresa, incluindo:

- Produtos cadastrados.
- Cotações abertas e activas.
- Cotações finalizadas.
- Alertas de reposição urgente baseados no stock mínimo.
- Acessos rápidos para comparador de preços, pedidos e gestão do catálogo.

As métricas de cotações activas excluem negociações encerradas ou parcialmente encerradas, evitando que uma cotação já concluída permaneça apresentada como aberta.

### Catálogo, stock e preços

- Cadastro de produtos por empresa.
- Identificação por EAN, marca, NCM e CEST.
- Imagem, unidade e quantidade por caixa.
- Custos, preço de venda e último preço de compra.
- Stock actual, mínimo, ideal e máximo.
- Importação de produtos por planilhas `.xls` e `.xlsx`.
- Alertas para reposição de itens abaixo do mínimo.

### Portal do representante e das distribuidoras

O portal permite que representantes trabalhem com várias empresas fornecedoras. Cada empresa representada possui identidade comercial e dados próprios, mesmo quando partilha o mesmo representante.

Exemplo: DPC e Solfarma podem ser geridas pelo mesmo representante sem que:

- as respostas de uma empresa apareçam na outra;
- os preços sejam misturados;
- os pedidos sejam encaminhados para o fornecedor errado;
- os estados de uma negociação alterem a outra.

As respostas são isoladas por vínculo específico entre cotação e distribuidora
(`quotation_supplier_id`). Os pedidos novos também guardam esse vínculo, além
do identificador do representante, para que duas distribuidoras do mesmo
representante nunca compartilhem respostas ou pedidos.

### Gestão cadastral da empresa

A área de configurações permite manter:

- Razão social.
- Nome fantasia.
- CNPJ.
- E-mail e telefone.
- CEP.
- Logradouro, número e bairro.
- Cidade e estado.
- Tipo de estabelecimento.

O preenchimento pode ser acelerado por integrações de CNPJ e CEP, reduzindo erros de digitação e mantendo os dados corporativos disponíveis no relacionamento com representantes.

### Cotações e comparativo de preços

- Criação de cotações com prazo e condição de pagamento.
- Distribuição para vários fornecedores.
- Links individuais com tokens por fornecedor.
- Respostas de preço por produto.
- Marcação de produtos indisponíveis.
- Observações do representante.
- Comparação por fornecedor e por item.
- Opção de não comprar um produto.
- Persistência dos itens não pedidos, incluindo produtos sem oferta.
- Geração de pedidos consolidados por fornecedor.
- Exportação da decisão em CSV para consulta e conferência.

### Ciclo de vida dos pedidos

O fluxo operacional suporta os seguintes estados:

```text
SENT ───────────────► DISPATCHED ───────────────► RECEIVED ───────────────► CLOSED
  └────────────────────────────────────────────► RECEIVED
```

- `SENT`: pedido criado e enviado pelo lojista.
- `DISPATCHED`: etapa disponível para fluxos operacionais que necessitem de
  encaminhamento.
- `RECEIVED`: lojista confirmou o recebimento da mercadoria.
- `CLOSED`: conferência concluída e negociação baixada.

Quando uma cotação possui múltiplos fornecedores, o status geral pode ser `PARTIALLY_CLOSED` até que todos os pedidos associados sejam encerrados.

---

## Arquitetura da solução

O projecto utiliza o **Next.js App Router** como camada web e BFF, combinando páginas React, componentes client-side e Route Handlers para APIs server-side.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
│  Dashboard • Catálogo • Cotações • Pedidos • Portal B2B     │
├─────────────────────────────────────────────────────────────┤
│                   Route Handlers / API                      │
│  Validação • Regras de negócio • Transacções • Auditoria    │
├─────────────────────────────────────────────────────────────┤
│                 Drizzle ORM + PostgreSQL                    │
│  Multi-tenant • Snapshots • Índices • Migrações             │
├─────────────────────────────────────────────────────────────┤
│             Integrações públicas brasileiras                 │
│                    BrasilAPI • ViaCEP                       │
└─────────────────────────────────────────────────────────────┘
```

### Camadas principais

| Camada | Responsabilidade |
| --- | --- |
| `src/app` | Páginas do App Router e endpoints HTTP da aplicação |
| `src/components` | Componentes de interface reutilizáveis e fluxos de UI |
| `src/db` | Schema Drizzle, cliente de base de dados e migrações |
| `src/modules` | Serviços e regras de negócio organizadas por domínio |
| `src/types` | Tipos e contratos partilhados |
| `src/utils` | Formatação, cálculos e utilitários puros |

### Princípios de engenharia

- **Isolamento por escopo:** consultas e operações comerciais devem respeitar `companyId`, `supplierId` e `quotationSupplierId`.
- **Transacções:** criação de pedidos, itens não pedidos, alterações de estado e auditoria devem ser consistentes.
- **Idempotência:** índices únicos evitam pedidos duplicados para a mesma cotação e fornecedor.
- **Snapshots comerciais:** os dados relevantes do pedido são copiados no momento da finalização para preservar o histórico.
- **Tipagem ponta a ponta:** TypeScript e Drizzle reduzem divergências entre modelo e código.
- **Validação explícita:** entradas inválidas devem gerar respostas HTTP claras, sem fallbacks silenciosos.

---

## Modelo multi-tenant

O isolamento é aplicado em dois níveis:

### Empresa lojista

Produtos, categorias, cotações e pedidos pertencem à empresa através de `companyId`. Uma empresa não deve consultar ou alterar os dados de outra.

### Empresa fornecedora representada

Um representante pode trabalhar com várias empresas. O vínculo é mantido por `supplierBrands` e as conexões com lojistas por `supplierConnections`.

Para uma cotação com DPC e Solfarma, a separação correcta é:

```text
quotation
├── quotation_suppliers (DPC)
│   └── quotation_supplier_items (preços da DPC)
└── quotation_suppliers (Solfarma)
    └── quotation_supplier_items (preços da Solfarma)
```

O `supplierId` do representante, sozinho, não é suficiente para identificar a empresa fornecedora. O sistema deve sempre utilizar o fornecedor específico associado à resposta ou ao pedido.

---

## Arquitectura da base de dados

A persistência utiliza PostgreSQL com Drizzle ORM. O schema principal está em [`src/db/schema.ts`](src/db/schema.ts).

### Tabelas centrais

| Tabela | Finalidade | Chaves/escopo relevantes |
| --- | --- | --- |
| `companies` | Dados cadastrais das empresas lojistas | `id`; razão social, CNPJ e morada |
| `users` | Utilizadores associados a uma empresa | `company_id` |
| `products` | Catálogo, stock e preços | `company_id`; EAN único por empresa |
| `categories` | Categorias do catálogo | `company_id` |
| `suppliers` | Representantes/fornecedores com acesso ao portal | `id`; credenciais e contacto |
| `supplier_brands` | Empresas/marcas representadas por um fornecedor | `supplier_id` |
| `supplier_connections` | Relação entre lojistas e fornecedores | `company_id` + `supplier_id` |
| `quotations` | Cabeçalho da cotação | `company_id`; prazo e condição |
| `quotation_items` | Produtos solicitados na cotação | `quotation_id` + `product_id` |
| `quotation_suppliers` | Participação individual de cada distribuidora | `quotation_id` + `id`; `supplier_id` e `brand_id`; token |
| `quotation_supplier_items` | Respostas de preço por fornecedor | `quotation_supplier_id` + `product_id` |
| `purchase_orders` | Pedido final por distribuidora | `quotation_id` + `quotation_supplier_id`; `supplier_id` como compatibilidade |
| `purchase_order_items` | Snapshot dos itens comprados | descrição, imagem, quantidade e preço |
| `quotation_unrequested_items` | Itens não comprados na negociação | `quotation_id` + `product_id` |
| `audit_logs` | Eventos importantes do processo | empresa, cotação, fornecedor e acção |

### Integridade comercial

O schema contém índices únicos para evitar:

- EAN duplicado dentro da mesma empresa.
- Mais de um pedido para a mesma combinação de cotação e fornecedor.
- Mais de um registo de item não pedido para a mesma cotação e produto.

As migrações existentes encontram-se em [`src/db/migrations`](src/db/migrations).

---

## Fluxo de cotações e pedidos

```text
Lojista
  │
  ├─ 1. Selecciona produtos e condição de pagamento
  ├─ 2. Cria cotação para fornecedores
  │
  ▼
Fornecedores
  │
  ├─ 3. Acedem ao token individual
  ├─ 4. Respondem preços, indisponibilidades e observações
  │
  ▼
Comparador
  │
  ├─ 5. Lojista escolhe fornecedor por produto
  ├─ 6. Marca itens não pedidos
  ├─ 7. Finaliza pedidos separados por fornecedor
  │
  ▼
Operação
  │
  ├─ 8. Representante recebe o pedido separado da sua distribuidora
  ├─ 9. Representante envia o pedido no sistema externo da empresa
  ├─ 10. Representante marca o recebimento como encerrado no sistema
  └─ 11. Histórico e auditoria registram a operação
```

Cada etapa relevante deve ser reflectida no estado persistido e no histórico de auditoria.

---

## Arquivos principais

Os arquivos abaixo concentram as decisões e os fluxos mais importantes do
projeto:

- [`src/app/page.tsx`](src/app/page.tsx) apresenta o dashboard do lojista, com
  métricas de produtos, cotações ativas, cotações concluídas e alertas de
  estoque mínimo.
- [`src/app/cotacoes/nova/page.tsx`](src/app/cotacoes/nova/page.tsx) implementa
  a criação de uma cotação. O lojista informa produtos, quantidades, prazo,
  condição de pagamento, fornecedores participantes e se a quantidade deve
  ficar visível para o representante.
- [`src/app/cotacoes/editar/[id]/page.tsx`](src/app/cotacoes/editar/[id]/page.tsx)
  permite alterar os mesmos dados da criação, incluindo os fornecedores
  participantes e a opção de marcar ou desmarcar todos.
- [`src/app/cotacoes/respostas/[id]/page.tsx`](src/app/cotacoes/respostas/[id]/page.tsx)
  é o comparador principal. Ele calcula o menor preço, permite decisões
  individuais, agrupa a escolha por distribuidora, registra itens não
  comprados, exibe o resumo final e gera pedidos.
- [`src/app/cotacoes/pedidos/[id]/page.tsx`](src/app/cotacoes/pedidos/[id]/page.tsx)
  mostra os pedidos separados por distribuidora, seus itens, valores, status e
  ações de acompanhamento.
- [`src/app/portal/painel/page.tsx`](src/app/portal/painel/page.tsx) contém o
  painel do representante, incluindo marcas representadas, cotações recebidas,
  conexões com lojistas e pedidos destinados à distribuidora ativa.
- [`src/app/portal/cotacao/[token]/page.tsx`](src/app/portal/cotacao/[token]/page.tsx)
  é a tela usada pelo representante para responder uma cotação através do
  token específico do vínculo.
- [`src/app/api/portal/quotations/route.ts`](src/app/api/portal/quotations/route.ts)
  lista cotações do portal e agrupa os itens pelo `quotationSupplierId`.
- [`src/app/api/portal/cotacoes/detalhes/route.ts`](src/app/api/portal/cotacoes/detalhes/route.ts)
  carrega os dados e preços exclusivos de uma participação de fornecedor.
- [`src/app/api/quotations/[id]/finalize/route.ts`](src/app/api/quotations/%5Bid%5D/finalize/route.ts)
  valida as escolhas, grava itens não comprados, cria pedidos separados e
  controla as transições de status.
- [`src/db/schema.ts`](src/db/schema.ts) define o modelo PostgreSQL usado pela
  aplicação, incluindo empresas, produtos, fornecedores, marcas, cotações,
  respostas, pedidos e auditoria.
- [`src/services/quotationService.ts`](src/services/quotationService.ts)
  concentra a criação de vínculos entre cotação, representante e
  distribuidora.
- [`src/lib/authServer.ts`](src/lib/authServer.ts) valida a sessão da empresa
  nas operações server-side.
- [`src/db/migrations`](src/db/migrations) contém as alterações versionadas
  necessárias para manter o banco compatível com o código.

---

## Estrutura do repositório

```text
.
├── public/                         # Recursos estáticos
├── src/
│   ├── app/
│   │   ├── api/                    # Route Handlers da API
│   │   ├── cotacoes/               # Fluxos de cotação e pedidos
│   │   ├── configuracoes/          # Configurações da empresa
│   │   ├── portal/                 # Portal do representante
│   │   └── page.tsx                # Dashboard principal
│   ├── components/                 # Componentes React reutilizáveis
│   ├── db/
│   │   ├── migrations/             # Migrações SQL/Drizzle
│   │   ├── db.ts                   # Cliente Drizzle
│   │   └── schema.ts               # Modelo relacional
│   ├── modules/                    # Serviços de domínio
│   ├── types/                      # Contratos TypeScript
│   └── utils/                      # Funções utilitárias
├── drizzle.config.ts               # Configuração do Drizzle Kit
├── next.config.ts                  # Configuração do Next.js
├── package.json                    # Scripts e dependências
└── .env.example                    # Modelo de variáveis locais
```

---

## Pré-requisitos

Antes de iniciar, instale:

- **Node.js 20 ou superior** — versão recomendada para o stack actual.
- **npm 10+** ou **pnpm 9+**.
- **PostgreSQL 14 ou superior**, local ou gerido por um serviço compatível.
- Git.

Confirme as versões:

```bash
node --version
npm --version
psql --version
```

---

## Instalação e configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/Irivania/Economia-Certa.git
cd Economia-Certa
```

### 2. Instalar dependências

Com npm:

```bash
npm install
```

Com pnpm:

```bash
pnpm install
```

### 3. Configurar o ambiente

Copie o ficheiro de exemplo:

```bash
copy .env.example .env.local
```

No macOS/Linux:

```bash
cp .env.example .env.local
```

Preencha pelo menos `DATABASE_URL` com a string de conexão PostgreSQL. O `drizzle.config.ts` carrega `.env.local` e `.env`.

### 4. Aplicar o schema/migrações

Para sincronizar o schema durante o desenvolvimento:

```bash
npx drizzle-kit push
```

Para executar as migrações versionadas já geradas:

```bash
npx drizzle-kit migrate
```

Em produção, prefira migrações versionadas e valide previamente a existência de dados duplicados antes de aplicar índices únicos.

---

## Execução

### Desenvolvimento

```bash
npm run dev
```

A aplicação ficará disponível em:

<http://localhost:3000>

### Produção

```bash
npm run build
npm run start
```

---

## Testes e qualidade

Scripts disponíveis:

```bash
# Verificação de lint
npm run lint

# Testes unitários
npm run test

# Testes End-to-End, quando configurados
npx playwright test
```

Antes de abrir um pull request, recomenda-se executar:

```bash
npm run lint
npm run test
npm run build
```

Alterações no fluxo de cotações devem ser validadas, no mínimo, para:

- duas empresas representadas pelo mesmo representante;
- respostas isoladas por fornecedor;
- pedidos separados por fornecedor;
- itens não pedidos persistidos;
- transições inválidas de estado;
- encerramento parcial e total da cotação;
- duplicidade de pedidos;
- autorização por empresa e fornecedor.

---

## Integrações externas

### BrasilAPI

Utilizada para auxiliar o preenchimento de dados corporativos a partir do CNPJ, como razão social, nome fantasia, contactos e endereço.

### ViaCEP

Utilizada para completar o endereço a partir do CEP.

As chamadas passam por rotas internas da aplicação para que os componentes do frontend não dependam directamente da implementação externa.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição | Exemplo |
| --- | --- | --- | --- |
| `DATABASE_URL` | Sim | String de conexão com PostgreSQL | `postgresql://utilizador:senha@localhost:5432/economia_certa` |
| `NEXT_PUBLIC_DATABASE_URL` | Conforme ambiente legado | Variável mantida para compatibilidade com configurações existentes | `postgresql://...` |
| `NEXT_PUBLIC_APP_URL` | Recomendada | URL pública/base da aplicação | `http://localhost:3000` |

> Nunca versione `.env`, `.env.local` ou credenciais reais. Utilize o `.env.example` apenas como contrato de configuração, sem segredos.

---

## Observações de segurança e operação

- Não exponha credenciais de PostgreSQL no frontend ou em logs.
- Tokens de cotação devem ser tratados como credenciais de acesso ao fluxo do fornecedor.
- Operações de alteração de estado devem ser validadas no backend, não apenas na interface.
- Toda consulta comercial deve respeitar o escopo de empresa e fornecedor.
- Em ambientes produtivos, utilize HTTPS, backups, rotação de segredos e monitorização.
- Antes de aplicar migrações destrutivas ou índices únicos, faça backup e inspeccione dados existentes.

---

## Estado do projecto

O projeto encontra-se em evolução ativa, com o fluxo principal de cotações,
respostas, pedidos separados por distribuidora, exportação da decisão,
encerramento interno e histórico já estruturado. O README documenta a versão
atual do sistema; a URL do vídeo deve ser preenchida antes da submissão ao
CS50.

Áreas recomendadas para evolução contínua:

- Sessões server-side com cookies `HttpOnly` e autorização centralizada.
- Testes de integração para isolamento entre empresas representadas.
- Observabilidade com logs estruturados, métricas e tracing.
- Pipeline CI/CD com lint, testes, build e migrações verificadas.
- Documentação OpenAPI dos endpoints públicos e internos.

---

## Contribuição

1. Crie uma branch a partir da principal.
2. Faça uma alteração pequena e focada.
3. Adicione ou actualize testes relacionados.
4. Execute lint, testes e build.
5. Abra um pull request descrevendo impacto, migrações e riscos operacionais.

Commits devem ser claros, atómicos e orientados ao domínio, por exemplo:

```text
feat(cotacoes): separar pedidos por fornecedor representado
fix(portal): exibir dados cadastrais completos da loja
test(finalize): validar transições de estado do pedido
```

---

## Licença

Este projecto é distribuído sob a licença MIT. Consulte o ficheiro [`LICENSE`](LICENSE) para os termos completos.
