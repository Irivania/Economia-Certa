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
    // Campos regulatórios, fiscais (Reforma Tributária) e logísticos
    classTrib: text("class_trib"),
    anvisaRegistry: text("anvisa_registry"),
    manufacturerName: text("manufacturer_name"),
    weight: text("weight"),
    dimensions: text("dimensions"),
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

export const purchaseOrders = pgTable("purchase_orders", {
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
}, (table) => ({
  quotationSupplierUnique: uniqueIndex("purchase_orders_quotation_supplier_idx").on(
    table.quotationId,
    table.quotationSupplierId,
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
  userId: text("user_id"),
  quotationId: text("quotation_id"),
  supplierId: text("supplier_id"),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela para Gestão de Contas a Pagar e Boletos
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
  status: text("status").default("PENDING").notNull(), // 'PENDING' ou 'PAID'
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela para Histórico de Rastreabilidade e Auditoria de Custos por Produto
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

// ==========================================
// MÓDULO PDV & SELF-CHECKOUT
// ==========================================

// Turnos de Caixa (Abertura, Fechamento e Sangria)
export const cashRegisters = pgTable("cash_registers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  userId: text("user_id").notNull(),
  operatorName: text("operator_name").notNull(),
  openingAmount: numeric("opening_amount", { precision: 10, scale: 2 }).notNull(),
  closingAmount: numeric("closing_amount", { precision: 10, scale: 2 }),
  differenceAmount: numeric("difference_amount", { precision: 10, scale: 2 }),
  status: text("status").default("OPEN").notNull(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

// Vendas do PDV (Presencial, Self-Checkout ou Convênio)
export const sales = pgTable("sales", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  cashRegisterId: text("cash_register_id"),
  mode: text("mode").default("CASHIER").notNull(), // 'CASHIER' ou 'SELF_CHECKOUT'
  operatorName: text("operator_name").default("Operador de Caixa").notNull(),
  customerName: text("customer_name"),
  partnerId: text("partner_id"), // Vinculado a funcionários ou empresas parceiras (Convênio)
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CONVENIO'
  status: text("status").default("COMPLETED").notNull(), // 'COMPLETED', 'CANCELLED', 'SUSPECTED_FRAUD'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Itens da Venda
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

// ==========================================
// MÓDULO DE CONVÊNIOS E FUNCIONÁRIOS
// ==========================================

// Cadastro de Funcionários e Empresas Parceiras (Desconto em Folha / Crediário Mensal)
export const partners = pgTable("partners", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  type: text("type").default("EMPLOYEE").notNull(), // 'EMPLOYEE' (Funcionário) ou 'COMPANY_PARTNER' (Empresa Conveniada)
  name: text("name").notNull(),
  document: text("document"), // CPF ou CNPJ
  phone: text("phone"),
  email: text("email"),
  creditLimit: numeric("credit_limit", { precision: 10, scale: 2 }).default("500.00").notNull(), // Limite de crédito mensal
  currentBalance: numeric("current_balance", { precision: 10, scale: 2 }).default("0.00").notNull(), // Saldo devedor atual
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }).default("0.00").notNull(), // Desconto fixo pré-programado (Ex: 10.00)
  companyPartnerId: text("company_partner_id"), // Vincula o funcionário à Empresa Parceira mãe
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});