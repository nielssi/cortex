"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Link2, X } from "lucide-react";

type NoteLink = { id: string; title: string };
type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
  linksFrom: { to: NoteLink }[];
  linksTo: { from: NoteLink }[];
};
type NoteStub = { id: string; title: string };

export function NoteEditor({ id }: { id: string }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [allNotes, setAllNotes] = useState<NoteStub[]>([]);
  const [linkSearch, setLinkSearch] = useState("");
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then((n: Note) => {
        setNote(n);
        setTitle(n.title);
        setBody(n.body);
      });
    fetch("/api/notes")
      .then((r) => r.json())
      .then(setAllNotes);
  }, [id]);

  const save = useCallback(async () => {
    setSaving(true);
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setSaving(false);
  }, [id, title, body]);

  // Autosave on blur / change with debounce
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(save, 1200);
    return () => clearTimeout(t);
  }, [title, body, note, save]);

  const deleteNote = async () => {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.push("/");
  };

  const addLink = async (toId: string) => {
    await fetch(`/api/notes/${id}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toId }),
    });
    const updated: Note = await fetch(`/api/notes/${id}`).then((r) => r.json());
    setNote(updated);
  };

  const removeLink = async (toId: string) => {
    await fetch(`/api/notes/${id}/links`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toId }),
    });
    const updated: Note = await fetch(`/api/notes/${id}`).then((r) => r.json());
    setNote(updated);
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  const connectedIds = new Set([
    ...note.linksFrom.map((l) => l.to.id),
    ...note.linksTo.map((l) => l.from.id),
    id,
  ]);
  const linkCandidates = allNotes.filter(
    (n) => !connectedIds.has(n.id) && n.title.toLowerCase().includes(linkSearch.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="text-xs text-slate-400 ml-auto">{saving ? "Saving…" : "Saved"}</span>
        <button
          onClick={() => setShowLinkPanel((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          <Link2 size={14} /> Connections
        </button>
        <button
          onClick={deleteNote}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <input
        className="w-full text-2xl font-bold text-slate-900 bg-transparent border-none outline-none mb-4 placeholder:text-slate-300"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
      />

      <textarea
        className="w-full min-h-[60vh] text-slate-700 bg-transparent border-none outline-none resize-none text-base leading-relaxed placeholder:text-slate-300"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Start writing…"
      />

      {showLinkPanel && (
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Connections</h3>

          {/* Existing connections */}
          <div className="flex flex-wrap gap-2 mb-4">
            {note.linksFrom.map((l) => (
              <span
                key={l.to.id}
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs rounded-full px-3 py-1"
              >
                <Link href={`/note/${l.to.id}`} className="hover:underline">{l.to.title}</Link>
                <button onClick={() => removeLink(l.to.id)} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            ))}
            {note.linksTo.map((l) => (
              <span
                key={l.from.id}
                className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs rounded-full px-3 py-1"
              >
                <Link href={`/note/${l.from.id}`} className="hover:underline">{l.from.title}</Link>
                <span className="text-slate-400 text-[10px]">← linked here</span>
              </span>
            ))}
            {note.linksFrom.length === 0 && note.linksTo.length === 0 && (
              <p className="text-xs text-slate-400">No connections yet.</p>
            )}
          </div>

          {/* Add connection */}
          <div className="border border-slate-200 rounded-xl p-3">
            <input
              className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400 mb-2"
              placeholder="Search notes to connect…"
              value={linkSearch}
              onChange={(e) => setLinkSearch(e.target.value)}
            />
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {linkCandidates.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  onClick={() => addLink(n.id)}
                  className="text-left text-sm text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg px-2 py-1 transition-colors"
                >
                  {n.title}
                </button>
              ))}
              {linkCandidates.length === 0 && (
                <p className="text-xs text-slate-400 px-2">No matching notes.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
