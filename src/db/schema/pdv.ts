import { pgTable, text, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";

/**
 * Tabela de Gestão de Caixas (Abertura, Fecho e Sessões de Operação)
 */
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
  status: text("status").default("OPEN").notNull(), // OPEN, PAUSED, CLOSED
  pausedAt: timestamp("paused_at"),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

/**
 * Tabela de Transações de Caixa (Suprimentos, Sangrias e Entradas Avulsas)
 */
export const cashRegisterTransactions = pgTable("cash_register_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  cashRegisterId: text("cash_register_id").notNull(),
  type: text("type").notNull(), // SUPPLY (suprimento), WITHDRAWAL (sangria)
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason"),
  operatorName: text("operator_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tabela de Vendas / Cabeçalho do Cupom ou Pedido PDV
 */
export const sales = pgTable("sales", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  cashRegisterId: text("cash_register_id"),
  mode: text("mode").default("CASHIER").notNull(), // CASHIER, DELIVERY, etc.
  operatorName: text("operator_name").default("Operador de Caixa").notNull(),
  customerName: text("customer_name"),
  customerDocument: text("customer_document"),
  partnerId: text("partner_id"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // CREDIT, DEBIT, PIX, CASH, etc.
  status: text("status").default("COMPLETED").notNull(), // COMPLETED, CANCELLED, PENDING
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tabela de Itens da Venda (Detalhe dos Produtos Comercializados)
 */
export const saleItems = pgTable("sale_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  saleId: text("sale_id").notNull(),
  productId: text("product_id").notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});

/**
 * Tabela de Autorizações Remotas de Supervisão (Remote Supervisor Override)
 * Utilizada para cancelamentos de itens, estornos ou descontos especiais à distância.
 */
export const supervisorRequests = pgTable("supervisor_requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  terminalId: text("terminal_id").notNull(), // Ex: "CAIXA-01"
  operatorName: text("operator_name").notNull(), // Operador que solicitou
  actionType: text("action_type").notNull(), // Ex: "CANCEL_ITEM", "APPLY_DISCOUNT", "VOID_SALE"
  payload: jsonb("payload").notNull(), // Dados flexíveis da ação (produto, qtd, valor, etc.)
  status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED
  supervisorName: text("supervisor_name"), // Gestor que aprovou/rejeitou
  reason: text("reason"), // Justificativa opcional
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
