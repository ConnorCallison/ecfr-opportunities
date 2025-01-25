CREATE TABLE "analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"chapter_id" text NOT NULL,
	"complexity_score" integer NOT NULL,
	"business_cost_score" integer NOT NULL,
	"market_impact_score" integer NOT NULL,
	"administrative_cost_score" integer NOT NULL,
	"model_version" varchar(50) NOT NULL,
	"prompt_version" varchar(50) NOT NULL,
	"analysis_date" timestamp DEFAULT now() NOT NULL,
	"complexity_reasoning" text NOT NULL,
	"cost_reasoning" text NOT NULL,
	"impact_reasoning" text NOT NULL,
	"admin_reasoning" text NOT NULL,
	"total_score" integer NOT NULL,
	"automation_potential" integer NOT NULL,
	"recommendations" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "analyses_chapter_id_unique" UNIQUE("chapter_id")
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"title_id" integer NOT NULL,
	"number" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queries" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"response" text NOT NULL,
	"relevant_chapters" text[] NOT NULL,
	"embedding" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_title_id_titles_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embedding_idx" ON "queries" USING btree ("embedding");