ALTER TABLE "appointments" ADD COLUMN "cancelled_by" "role";--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();