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

// 3. Tabela de Produtos da Loja
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
});