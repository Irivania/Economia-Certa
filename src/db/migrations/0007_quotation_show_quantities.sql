ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS show_quantities boolean NOT NULL DEFAULT true;
