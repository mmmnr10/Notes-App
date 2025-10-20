import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Skapar (eller öppnar) en SQLite-fil i projektet
const sqlite = new Database("notes.db");
export const db = drizzle(sqlite, { schema });
