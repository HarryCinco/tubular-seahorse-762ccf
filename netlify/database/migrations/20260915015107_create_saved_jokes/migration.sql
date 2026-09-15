CREATE TABLE "saved_jokes" (
	"id" serial PRIMARY KEY,
	"visitor_id" text NOT NULL,
	"joke_api_id" integer NOT NULL,
	"category" text NOT NULL,
	"type" text NOT NULL,
	"setup" text,
	"delivery" text,
	"joke" text,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "saved_jokes_visitor_joke_idx" ON "saved_jokes" ("visitor_id","joke_api_id");--> statement-breakpoint
CREATE INDEX "saved_jokes_visitor_idx" ON "saved_jokes" ("visitor_id");