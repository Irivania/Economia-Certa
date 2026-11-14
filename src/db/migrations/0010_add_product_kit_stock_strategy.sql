ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_kit boolean NOT NULL DEFAULT false;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS use_fixed_stock boolean NOT NULL DEFAULT false;
