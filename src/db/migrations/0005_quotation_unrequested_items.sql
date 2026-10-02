CREATE TABLE IF NOT EXISTS "quotation_unrequested_items" (
  "id" text PRIMARY KEY NOT NULL,
  "quotation_id" text NOT NULL,
  "product_id" text NOT NULL,
  "description" text NOT NULL,
  "image_url" text,
  "quantity" numeric NOT NULL,
  "reason" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "quotation_unrequested_product_idx"
ON "quotation_unrequested_items" ("quotation_id", "product_id");
