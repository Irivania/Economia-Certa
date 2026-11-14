import {
  pgTable,
  text,
  timestamp,
  date,
  numeric,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

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
  showQuantities: boolean("show_quantities").default(true).notNull(),
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
  brandId: text("brand_id"),
  token: text("token")
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  status: text("status").default("PENDING").notNull(),
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

export const quotationSupplierItems = pgTable("quotation_supplier_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quotationSupplierId: text("quotation_supplier_id").notNull(),
  productId: text("product_id").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }),
  outOfStock: boolean("out_of_stock").default(false),
});

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quotationId: text("quotation_id").notNull(),
    quotationSupplierId: text("quotation_supplier_id"),
    companyId: text("company_id").notNull(),
    supplierId: text("supplier_id").notNull(),
    paymentTerms: text("payment_terms"),
    status: text("status").default("SENT").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    receivedAt: timestamp("received_at"),
    closedAt: timestamp("closed_at"),
  },
  (table) => ({
    quotationSupplierUnique: uniqueIndex(
      "purchase_orders_quotation_supplier_idx",
    ).on(table.quotationId, table.quotationSupplierId),
  }),
);

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

export const quotationUnrequestedItems = pgTable(
  "quotation_unrequested_items",
  {
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
  },
  (table) => ({
    quotationProductUnique: uniqueIndex("quotation_unrequested_product_idx").on(
      table.quotationId,
      table.productId,
    ),
  }),
);
