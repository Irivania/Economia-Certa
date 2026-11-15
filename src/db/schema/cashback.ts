import {
  pgTable,
  text,
  timestamp,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";

// 1. Campanhas de Cashback configuradas pelo lojista
export const cashbackCampaigns = pgTable("cashback_campaigns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  name: text("name").notNull(), // Ex: "Super Cashback Skala & Kolene"
  scope: text("scope").notNull(), // 'GLOBAL', 'CATEGORY', 'PRODUCT'
  targetId: text("target_id"), // ID da Categoria ou do Produto (nulo se GLOBAL)
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(), // Ex: '5.00'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Extrato e Saldo de Cashback dos Clientes
export const customerCashbackBalance = pgTable("customer_cashback_balance", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  customerId: text("customerId").notNull(), // ID do cliente (tabela partners)
  balance: numeric("balance", { precision: 10, scale: 2 })
    .default("0.00")
    .notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Histórico de Lançamentos (Créditos em vendas e Resgates)
export const customerCashbackLedger = pgTable("customer_cashback_ledger", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  customerId: text("customer_id").notNull(),
  saleId: text("sale_id"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'EARNED' (Crédito) ou 'REDEEMED' (Resgate)
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
