import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
