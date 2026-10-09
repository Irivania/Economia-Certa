import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  numeric,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // Razão Social
  tradeName: text("trade_name"), // Nome Fantasia
  document: text("document"), // CNPJ
  email: text("email"),
  phone: text("phone"),
  cep: text("cep"),
  address: text("address"), // Logradouro
  number: text("number"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  type: text("type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  name: text("name").default("Usuário").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  role: text("role"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text("company_id").notNull(),
    description: text("description").notNull(),
    unit: text("unit").default("UN").notNull(),
    ean: text("ean"),
    brand: text("brand"),
    imageUrl: text("image_url"),
    category: text("category"),
    boxQuantity: integer("box_quantity").default(1).notNull(),
    costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
    lastPurchasePrice: numeric("last_purchase_price", {
      precision: 10,
      scale: 2,
    }),
    salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
    stockCurrent: integer("stock_current").default(0).notNull(),
    stockMin: integer("stock_min").default(0).notNull(),
    stockIdeal: integer("stock_ideal").default(0).notNull(),
    stockMax: integer("stock_max").default(0).notNull(),
    ncm: text("ncm"),
    cest: text("cest"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      companyEanIdx: uniqueIndex("company_ean_idx").on(
        table.companyId,
        table.ean,
      ),
    };
  },
);

export const suppliers = pgTable("suppliers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierBrands = pgTable("supplier_brands", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  supplierId: text("supplier_id").notNull(),
  tradeName: text("trade_name").notNull(),
  corporateName: text("corporate_name"),
  cnpj: text("cnpj"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierPasswordResets = pgTable("supplier_password_resets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  supplierId: text("supplier_id").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotations = pgTable("quotations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  title: text("title").default("Cotação Geral").notNull(),
  paymentTerms: text("payment_terms"),
  supplierId: text("supplier_id"),
  brandId: text("brand_id"),
  storeName: text("store_name"),
  token: text("token"),
  observation: text("observation"),
  status: text("status").default("PENDING").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  closingTime: text("closing_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotationSuppliers = pgTable("quotation_suppliers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quotationId: text("quotation_id").notNull(),
  supplierId: text("supplier_id").notNull(),
  token: text("token")
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  status: text("status").default("PENDING").notNull(), // 'PENDING' ou 'responded'
  totalOffered: numeric("total_offered", { precision: 10, scale: 2 }),
  observation: text("observation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotationItems = pgTable("quotation_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quotationId: text("quotation_id").notNull(),
  productId: text("product_id").notNull(),
  requestedQuantity: numeric("requested_quantity").notNull(),
});

// Tabela para isolar preços e respostas por fornecedor individualmente
export const quotationSupplierItems = pgTable("quotation_supplier_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quotationSupplierId: text("quotation_supplier_id").notNull(),
  productId: text("product_id").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }),
  outOfStock: boolean("out_of_stock").default(false),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quotationId: text("quotation_id").notNull(),
  companyId: text("company_id").notNull(),
  supplierId: text("supplier_id").notNull(),
  paymentTerms: text("payment_terms"),
  status: text("status").default("SENT").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  receivedAt: timestamp("received_at"),
  closedAt: timestamp("closed_at"),
}, (table) => ({
  quotationSupplierUnique: uniqueIndex("purchase_orders_quotation_supplier_idx").on(
    table.quotationId,
    table.supplierId,
  ),
}));

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  quantity: numeric("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  subtotal: numeric("subtotal").notNull(),
});

export const quotationUnrequestedItems = pgTable("quotation_unrequested_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quotationId: text("quotation_id").notNull(),
  productId: text("product_id").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  quantity: numeric("quantity").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  quotationProductUnique: uniqueIndex("quotation_unrequested_product_idx").on(
    table.quotationId,
    table.productId,
  ),
}));

export const supplierConnections = pgTable("supplier_connections", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  supplierId: text("supplier_id").notNull(),
  initiatedBy: text("initiated_by").notNull(),
  status: text("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id"),
  userId: text("user_id"), // 🔒 Rastreabilidade exata do colaborador que realizou a ação
  quotationId: text("quotation_id"),
  supplierId: text("supplier_id"),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});