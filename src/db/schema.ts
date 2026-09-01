import { pgTable, text, timestamp, integer, numeric } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  description: text('description').notNull(),
  unit: text('unit').default('UN').notNull(),
  ean: text('ean'),
  brand: text('brand'),
  category: text('category'),
  boxQuantity: integer('box_quantity').default(1).notNull(),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quotations = pgTable('quotations', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  title: text('title').default('Cotação Geral').notNull(),
  status: text('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quotationItems = pgTable('quotation_items', {
  id: text('id').primaryKey(),
  quotationId: text('quotation_id').notNull(),
  productId: text('product_id').notNull(),
  supplierId: text('supplier_id'),
  requestedQuantity: numeric('requested_quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }),
});