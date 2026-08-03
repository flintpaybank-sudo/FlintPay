import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://placeholder:placeholder@localhost:5432/placeholder';
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
export const getDb = () => db;
export { schema };
