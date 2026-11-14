import {
  pgTable,
  text,
  timestamp,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  tradeName: text("trade_name"),
  document: text("document"),
  email: text("email"),
  phone: text("phone"),
  cep: text("cep"),
  address: text("address"),
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

export const partners = pgTable("partners", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id").notNull(),
  type: text("type").default("EMPLOYEE").notNull(),
  name: text("name").notNull(),
  document: text("document"),
  phone: text("phone"),
  email: text("email"),
  creditLimit: numeric("credit_limit", { precision: 10, scale: 2 })
    .default("500.00")
    .notNull(),
  currentBalance: numeric("current_balance", { precision: 10, scale: 2 })
    .default("0.00")
    .notNull(),
  discountPercentage: numeric("discount_percentage", {
    precision: 5,
    scale: 2,
  })
    .default("0.00")
    .notNull(),
  companyPartnerId: text("company_partner_id"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
