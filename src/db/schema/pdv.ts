import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const cashRegisters = pgTable("cash_registers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  userId: text("user_id").notNull(),
  operatorName: text("operator_name").notNull(),
  openingAmount: numeric("opening_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  closingAmount: numeric("closing_amount", { precision: 10, scale: 2 }),
  differenceAmount: numeric("difference_amount", { precision: 10, scale: 2 }),
  status: text("status").default("OPEN").notNull(),
  pausedAt: timestamp("paused_at"),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const cashRegisterTransactions = pgTable("cash_register_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  cashRegisterId: text("cash_register_id").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason"),
  operatorName: text("operator_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  cashRegisterId: text("cash_register_id"),
  mode: text("mode").default("CASHIER").notNull(),
  operatorName: text("operator_name").default("Operador de Caixa").notNull(),
  customerName: text("customer_name"),
  partnerId: text("partner_id"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").default("COMPLETED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const saleItems = pgTable("sale_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  saleId: text("sale_id").notNull(),
  productId: text("product_id").notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});
