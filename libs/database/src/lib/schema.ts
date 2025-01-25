import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Core eCFR structure
export const titles = pgTable('titles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chapters = pgTable('chapters', {
  id: text('id').primaryKey(),
  titleId: integer('title_id')
    .notNull()
    .references(() => titles.id),
  number: varchar('number', { length: 10 }).notNull(), // e.g., "I", "II", "III"
  name: text('name').notNull(),
  content: text('content').notNull(), // Markdown content
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analysis scores and metadata
export const analyses = pgTable('analyses', {
  id: text('id').primaryKey(),
  chapterId: text('chapter_id')
    .notNull()
    .references(() => chapters.id)
    .unique(),

  // Core metrics (1-100)
  complexityScore: integer('complexity_score').notNull(), // Overall complexity
  businessCostScore: integer('business_cost_score').notNull(), // Direct cost impact
  marketImpactScore: integer('market_impact_score').notNull(), // Market effect
  administrativeCostScore: integer('administrative_cost_score').notNull(), // Admin burden

  // Analysis metadata
  modelVersion: varchar('model_version', { length: 50 }).notNull(),
  promptVersion: varchar('prompt_version', { length: 50 }).notNull(),
  analysisDate: timestamp('analysis_date').defaultNow().notNull(),

  // Detailed analysis
  complexityReasoning: text('complexity_reasoning').notNull(),
  costReasoning: text('cost_reasoning').notNull(),
  impactReasoning: text('impact_reasoning').notNull(),
  adminReasoning: text('admin_reasoning').notNull(),

  // Aggregate metrics
  totalScore: integer('total_score').notNull(),
  automationPotential: integer('automation_potential').notNull(),

  // Recommendations
  recommendations: text('recommendations').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User interactions and queries
export const queries = pgTable(
  'queries',
  {
    id: text('id').primaryKey(),
    question: text('question').notNull(),
    response: text('response').notNull(),
    relevantChapters: text('relevant_chapters').array().notNull(),
    embedding: text('embedding').array().notNull(), // Store as JSON array
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      embeddingIdx: index('embedding_idx').on(table.embedding),
    };
  }
);
