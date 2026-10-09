ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS quotation_supplier_id text;

DROP INDEX IF EXISTS purchase_orders_quotation_supplier_idx;

CREATE UNIQUE INDEX IF NOT EXISTS purchase_orders_quotation_supplier_idx
ON purchase_orders (quotation_id, quotation_supplier_id);
