CREATE TABLE IF NOT EXISTS product_compositions (
  id text PRIMARY KEY NOT NULL,
  product_id text NOT NULL,
  component_product_id text NOT NULL,
  quantity numeric NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS product_compositions_product_component_idx
  ON product_compositions (product_id, component_product_id);
