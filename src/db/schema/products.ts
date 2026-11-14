import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

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
    classTrib: text("class_trib"),
    anvisaRegistry: text("anvisa_registry"),
    manufacturerName: text("manufacturer_name"),
    weight: text("weight"),
    dimensions: text("dimensions"),
    
    // 💡 NOVOS CAMPOS PARA SUPORTE A KITS E ESTRATÉGIA HÍBRIDA DE ESTOQUE
    isKit: boolean("is_kit").default(false).notNull(),
    useFixedStock: boolean("use_fixed_stock").default(false).notNull(), // false = Dinâmico (gargalo dos filhos), true = Fixo/Independente

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    companyEanIdx: uniqueIndex("company_ean_idx").on(
      table.companyId,
      table.ean,
    ),
  }),
);

export const productCompositions = pgTable(
  "product_compositions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id").notNull(),
    componentProductId: text("component_product_id").notNull(),
    quantity: numeric("quantity").notNull(),
  },
  (table) => ({
    productComponentUnique: uniqueIndex(
      "product_compositions_product_component_idx",
    ).on(table.productId, table.componentProductId),
  }),
);