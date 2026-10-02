CREATE UNIQUE INDEX IF NOT EXISTS "purchase_orders_quotation_supplier_idx"
ON "purchase_orders" ("quotation_id", "supplier_id");
