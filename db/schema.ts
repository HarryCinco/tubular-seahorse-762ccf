import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const savedJokes = pgTable('saved_jokes', {
  id: serial().primaryKey(),
  visitorId: text('visitor_id').notNull(),
  jokeApiId: integer('joke_api_id').notNull(),
  category: text().notNull(),
  type: text().notNull(),
  setup: text(),
  delivery: text(),
  joke: text(),
  savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('saved_jokes_visitor_joke_idx').on(table.visitorId, table.jokeApiId),
  index('saved_jokes_visitor_idx').on(table.visitorId),
])
