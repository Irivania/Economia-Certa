import { pgTable, uuid, text, timestamp, boolean, integer, numeric } from 'drizzle-orm/pg-core';

// 1. Tabela de Empresas (Multi-tenancy)
export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  document: text('document').notNull().unique(), // CNPJ
  type: text('type').notNull(), // 'STORE' | 'SUPPLIER'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Tabela de Usuários (RBAC)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'ADMIN' | 'BUYER' | 'OPERATOR' | 'REPRESENTATIVE'
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Tabela de Produtos da Loja (Profissional com Dados Fiscais)
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),
  internalCode: text('internal_code'),
  ean: text('ean'),
  description: text('description').notNull(),
  brand: text('brand'),
  category: text('category'),
  unit: text('unit').notNull(), // ex: UN, CX, FD
  boxQuantity: integer('box_quantity').default(1).notNull(),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  // Campos Fiscais (Padrão Brasil)
  ncm: text('ncm'), // Nomenclatura Comum do Mercosul
  cest: text('cest'), // Código Especificador da Substituição Tributária
  origin: text('origin').default('0'), // 0: Nacional, 1: Estrangeiro, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Tabela de Fornecedores
export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  document: text('document'),
  contactEmail: text('contact_email'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Tabela de Cabeçalho de Cotações
export const quotations = pgTable('quotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  status: text('status').default('OPEN').notNull(), // 'OPEN' | 'COMPLETED' | 'CANCELLED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Tabela de Itens e Propostas da Cotação por Fornecedor (Com Condições Comerciais)
export const quotationItems = pgTable('quotation_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quotationId: uuid('quotation_id')
    .references(() => quotations.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  supplierId: uuid('supplier_id')
    .references(() => suppliers.id, { onDelete: 'cascade' })
    .notNull(),
  requestedQuantity: numeric('requested_quantity', { precision: 10, scale: 2 }).default('1').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).default('0').notNull(),
  // Condições Comerciais da Proposta
  deliveryTimeDays: integer('delivery_time_days').default(1).notNull(), // Prazo de entrega em dias
  paymentTerms: text('payment_terms').default('À vista'), // Condição de pagamento
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Tabela de Categorias da Loja
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Tabela de Marcas da Loja
export const brands = pgTable('brands', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});