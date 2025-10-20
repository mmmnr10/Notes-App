import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  favorite: integer("favorite", { mode: "boolean" }).default(false),
  createdAt: text("createdAt").default("CURRENT_TIMESTAMP"),
});
