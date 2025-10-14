import { createServerFn } from "@tanstack/react-start";
import fs from "fs/promises";

const filePath = "notes-file.json";

export type Note = {
  id: number;
  title: string;
  body?: string;
  favorite: boolean;
};

async function readNotes(): Promise<Note[]> {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

async function writeNotes(notes: Note[]) {
  await fs.writeFile(filePath, JSON.stringify(notes, null, 2), "utf-8");
}

export const readNotesServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<Note[]> => readNotes()
);

export const readNoteByIdServer = createServerFn({ method: "GET" })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }): Promise<Note> => {
    const notes = await readNotes();
    const note = notes.find((n) => n.id === id);
    if (!note) throw new Error(`Note ${id} not found`);
    return note;
  });

export const createNoteServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { title: string; body?: string; favorite?: boolean }) => input
  )
  .handler(async ({ data }) => {
    const notes = await readNotes();
    const nextId = notes.length ? Math.max(...notes.map((n) => n.id)) + 1 : 1;

    const newNote: Note = {
      id: nextId,
      title: data.title,
      body: data.body ?? "",
      favorite: data.favorite ?? false,
    };

    await writeNotes([...notes, newNote]);
    return newNote;
  });

export const updateNoteServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { id: number; patch: Partial<Omit<Note, "id">> }) => input
  )
  .handler(async ({ data }) => {
    const notes = await readNotes();
    const idx = notes.findIndex((n) => n.id === data.id);
    if (idx === -1) throw new Error(`Note ${data.id} not found`);

    const updated: Note = { ...notes[idx], ...data.patch };
    notes[idx] = updated;

    await writeNotes(notes);
    return updated;
  });

export const deleteNoteServer = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const notes = await readNotes();
    const next = notes.filter((n) => n.id !== id);
    if (next.length === notes.length) throw new Error(`Note ${id} not found`);
    await writeNotes(next);
    return { ok: true };
  });
