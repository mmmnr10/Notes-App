import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import { notes } from "./schema";
import { eq } from "drizzle-orm";

export type Note = {
  id: number;
  title: string;
  content?: string;
  favorite?: boolean;
  createdAt?: string;
};

// Hämta alla anteckningar
export const readNotesServer = createServerFn({ method: "GET" })
  .handler(async (): Promise<Note[]> => {
    return await db.select().from(notes);
  });

// Skapa ny
export const createNoteServer = createServerFn({ method: "POST" })
  .inputValidator((data: { title: string; content?: string; favorite?: boolean }) => data)
  .handler(async ({ data }) => {
    const [newNote] = await db
      .insert(notes)
      .values({
        title: data.title,
        content: data.content ?? "",
        favorite: data.favorite ?? false,
      })
      .returning();
    return newNote;
  });

// Uppdatera
export const updateNoteServer = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; patch: Partial<Note> }) => data)
  .handler(async ({ data }) => {
    const [updated] = await db
      .update(notes)
      .set(data.patch)
      .where(eq(notes.id, data.id))
      .returning();
    return updated;
  });

// Ta bort
export const deleteNoteServer = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.delete(notes).where(eq(notes.id, id));
    return { ok: true };
  });
