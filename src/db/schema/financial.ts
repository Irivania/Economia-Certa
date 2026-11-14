import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id"),
  userId: text("user_id"),
  quotationId: text("quotation_id"),
  supplierId: text("supplier_id"),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accountsPayable = pgTable("accounts_payable", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  supplierName: text("supplier_name").notNull(),
  invoiceNumber: text("invoice_number"),
  installmentNumber: integer("installment_number").default(1).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status").default("PENDING").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accountsReceivable = pgTable("accounts_receivable", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  customerName: text("customer_name").notNull(),
  invoiceNumber: text("invoice_number"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status").default("PENDING").notNull(),
  receivedAt: timestamp("received_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const importedInvoices = pgTable(
  "imported_invoices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text("company_id").notNull(),
    accessKey: text("access_key").notNull(),
    invoiceNumber: text("invoice_number").notNull(),
    issuerName: text("issuer_name").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    importedAt: timestamp("imported_at").defaultNow().notNull(),
  },
  (table) => ({
    companyAccessKeyUnique: uniqueIndex("company_access_key_idx").on(
      table.companyId,
      table.accessKey,
    ),
  }),
);

export const productCostHistory = pgTable("product_cost_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  productId: text("product_id").notNull(),
  supplierName: text("supplier_name").notNull(),
  invoiceNumber: text("invoice_number"),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }).notNull(),
  quantity: numeric("quantity").notNull(),
  purchasedBy: text("purchased_by").default("Sistema / Loja").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
