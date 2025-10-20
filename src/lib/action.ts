// src/lib/action.ts
import { createNoteServer, readNotesServer, Note } from "./notes";

export async function getNotes(): Promise<Note[]> {
  return await readNotesServer.handler();
}

export async function addNote(note: Omit<Note, "id" | "createdAt">) {
  return await createNoteServer.handler({ data: note });
}
