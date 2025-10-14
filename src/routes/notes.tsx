import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import {
  invalidateNotes,
  notesListQueryOptions,
  prefetchNotes,
} from "~/utils/notes";
import { createNoteServer } from "~/api/notes";
import { useState } from "react";

export const Route = createFileRoute("/notes")({
  loader: async ({ context }) => {
    await prefetchNotes(context.queryClient);
  },
  head: () => ({ meta: [{ title: "Notes" }] }),
  component: NotesComponent,
});

function NotesComponent() {
  const qc = useQueryClient();
  const notesQuery = useSuspenseQuery(notesListQueryOptions());
  const notes = notesQuery.data;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [favorite, setFavorite] = useState(false);

  const sortedNotes = [...notes].sort((a, b) => {
    return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
  });

  const addNote = useMutation({
    mutationFn: (data: { title: string; body?: string; favorite?: boolean }) =>
      createNoteServer({ data }),
    onSuccess: () => {
      invalidateNotes(qc);
      setTitle("");
      setBody("");
    },
  });

  const canSubmit = title.trim().length > 0 && !addNote.isPending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    addNote.mutate({ title, body, favorite: favorite });
  }

  return (
    <div className="p-2 flex gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Notes</h2>
        <ul className="list-disc pl-4 min-w-64">
          {sortedNotes.map((note) => (
            <li key={note.id} className="whitespace-nowrap">
              <Link
                to="/notes/$id"
                params={{ id: String(note.id) }}
                className="block py-1 text-blue-800 hover:text-blue-600"
                activeProps={{ className: "text-black font-bold" }}
              >
                <div>
                  {note.title} {note.favorite ? "*" : ""}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <hr className="border-l border-gray-300" />

      <div className="flex-1">
        <Outlet />

        <form onSubmit={onSubmit} className="mt-6 max-w-md space-y-3">
          <h3 className="text-base font-medium">Add a new note</h3>

          <label className="block">
            <span className="text-sm text-gray-700">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="Enter title"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="Optional body"
              rows={4}
            />
          </label>

          <div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
              />
              <span>Favorite</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`rounded-md px-4 py-2 text-white ${
              canSubmit
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {addNote.isPending ? "Adding..." : "Add note"}
          </button>

          {addNote.isError && (
            <p className="text-sm text-red-500">
              {(addNote.error as Error).message || "Failed to add note"}
            </p>
          )}
          {addNote.isSuccess && (
            <p className="text-sm text-green-500">Note added!</p>
          )}
        </form>
      </div>
    </div>
  );
}
