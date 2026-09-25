import { pgTable, text, timestamp, date, integer, numeric, boolean, uniqueIndex } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  document: text('document'),
  type: text('type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text('company_id').notNull(),
  name: text('name').default('Usuário').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  role: text('role'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text('company_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text('company_id').notNull(),
  description: text('description').notNull(),
  unit: text('unit').default('UN').notNull(),
  ean: text('ean'),
  brand: text('brand'),
  imageUrl: text('image_url'),
  category: text('category'),
  boxQuantity: integer('box_quantity').default(1).notNull(),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }),
  lastPurchasePrice: numeric('last_purchase_price', { precision: 10, scale: 2 }),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  stockCurrent: integer('stock_current').default(0).notNull(),
  stockMin: integer('stock_min').default(0).notNull(),
  stockIdeal: integer('stock_ideal').default(0).notNull(),
  stockMax: integer('stock_max').default(0).notNull(),
  ncm: text('ncm'),
  cest: text('cest'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    companyEanIdx: uniqueIndex('company_ean_idx').on(table.companyId, table.ean),
  };
});

export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text('company_id').notNull(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quotations = pgTable('quotations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text('company_id').notNull(),
  title: text('title').default('Cotação Geral').notNull(),
  paymentTerms: text('payment_terms'),
  supplierId: text('supplier_id'),
  storeName: text('store_name'),
  token: text('token'),
  observation: text('observation'),
  status: text('status').default('PENDING').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  closingTime: text('closing_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quotationSuppliers = pgTable('quotation_suppliers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  quotationId: text('quotation_id').notNull(),
  supplierId: text('supplier_id').notNull(),
  token: text('token').notNull().$defaultFn(() => crypto.randomUUID()),
  status: text('status').default('PENDING').notNull(),
  totalOffered: numeric('total_offered', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quotationItems = pgTable('quotation_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  quotationId: text('quotation_id').notNull(),
  productId: text('product_id').notNull(),
  supplierId: text('supplier_id'),
  requestedQuantity: numeric('requested_quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }),
  outOfStock: boolean('out_of_stock').default(false),
});