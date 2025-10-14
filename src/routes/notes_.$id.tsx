import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  invalidateNotes,
  noteByIdQueryOptions,
  prefetchNoteById,
  removeNoteFromCache,
} from "~/utils/notes";
import { deleteNoteServer, updateNoteServer } from "~/api/notes";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/notes_/$id")({
  loader: async ({ context, params }) => {
    const id = Number(params.id);
    await prefetchNoteById(context.queryClient, id);
  },
  component: NoteEdit,
});

function NoteEdit() {
  const navigate = useNavigate();
  const { id: idParam } = Route.useParams();
  const qc = useQueryClient();
  const id = Number(idParam);

  const noteQuery = useSuspenseQuery(noteByIdQueryOptions(id));
  const note = noteQuery.data;

  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body ?? "");
  const [favorite, setFavorite] = useState(!!note.favorite);

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body ?? "");
    setFavorite(!!note.favorite);
  }, [note.id]);

  const save = useMutation({
    mutationFn: (payload: {
      title: string;
      body?: string;
      favorite: boolean;
    }) => updateNoteServer({ data: { id, patch: payload } }),
    onSuccess: (updated) => {
      qc.setQueryData(["note", id], updated);
      invalidateNotes(qc);
      setTitle(updated.title);
      setBody(updated.body ?? "");
      setFavorite(!!updated.favorite);
      navigate({ to: "/notes" });
    },
  });

  const del = useMutation({
    mutationFn: () => deleteNoteServer({ data: id }),
    onSuccess: () => {
      invalidateNotes(qc);
      removeNoteFromCache(qc, id);
      navigate({ to: "/notes" });
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    save.mutate({
      title: title.trim(),
      body: body.trim() || "",
      favorite,
    });
  }

  return (
    <form onSubmit={onSubmit} className="p-2 max-w-xl space-y-3">
      <h2 className="text-xl font-semibold">Edit note {id}</h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border px-3 py-2"
        placeholder="Title"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full rounded border px-3 py-2"
        rows={5}
        placeholder="Body"
      />

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={favorite}
          onChange={(e) => setFavorite(e.target.checked)}
        />
        <span>Favorite</span>
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded px-4 py-2 bg-blue-600 text-white"
        >
          {save.isPending ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={() => del.mutate()}
          disabled={del.isPending}
          className="rounded px-4 py-2 border border-red-500 text-red-600"
        >
          {del.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </form>
  );
}
