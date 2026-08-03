import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow(),
});
