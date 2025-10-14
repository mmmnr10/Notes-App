import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Note, readNoteByIdServer, readNotesServer } from "~/api/notes";

export const notesListQueryOptions = () =>
  queryOptions<Note[]>({
    queryKey: ["notes"],
    queryFn: () => readNotesServer(),
  });

export const noteByIdQueryOptions = (id: number) =>
  queryOptions<Note>({
    queryKey: ["note", id],
    queryFn: () => readNoteByIdServer({ data: id }),
  });

export async function prefetchNotes(qc: QueryClient) {
  await qc.ensureQueryData(notesListQueryOptions());
}

export async function invalidateNotes(qc: QueryClient) {
  await qc.invalidateQueries({ queryKey: ["notes"] });
}

export async function prefetchNoteById(qc: QueryClient, id: number) {
  await qc.ensureQueryData(noteByIdQueryOptions(id));
}

export function removeNoteFromCache(qc: QueryClient, id: number) {
  qc.removeQueries({ queryKey: ["note", id] });
}
