ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "start_date" timestamp;
--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "end_date" timestamp;
