"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ArrowLeft, Trash2, X, Eye, Pencil, Tag } from "lucide-react";

type Category = { id: string; name: string; color: string; parentId: string | null; children: Category[] };
type NoteLink = { id: string; title: string };
type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category: Category | null;
  linksFrom: { to: NoteLink }[];
  linksTo: { from: NoteLink }[];
};
type NoteStub = { id: string; title: string };

const COLOR_OPTIONS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
];

function flattenCategories(cats: Category[], prefix = ""): { id: string; label: string; color: string }[] {
  return cats.flatMap((c) => [
    { id: c.id, label: prefix + c.name, color: c.color },
    ...flattenCategories(c.children ?? [], prefix + c.name + " › "),
  ]);
}

export function NoteEditor({ id }: { id: string }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [allNotes, setAllNotes] = useState<NoteStub[]>([]);
  const [linkSearch, setLinkSearch] = useState("");
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // New category form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const [newCatParent, setNewCatParent] = useState<string>("");

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then((n: Note) => {
        setNote({ ...n, linksFrom: n.linksFrom ?? [], linksTo: n.linksTo ?? [] });
        setTitle(n.title);
        setBody(n.body);
      });
    fetch("/api/notes").then((r) => r.json()).then(setAllNotes);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, [id]);

  const save = useCallback(async (patch: Partial<{ title: string; body: string; categoryId: string | null }>) => {
    setSaving(true);
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const updated: Note = await res.json();
    setNote((prev) => ({ ...prev!, ...updated, linksFrom: prev?.linksFrom ?? [], linksTo: prev?.linksTo ?? [] }));
    setSaving(false);
  }, [id]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => save({ title, body }), 1200);
    return () => clearTimeout(t);
  }, [title, body, note, save]);

  const setCategory = (categoryId: string | null) => {
    save({ categoryId });
    setShowCategoryPanel(false);
  };

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
    setNote({ ...updated, linksFrom: updated.linksFrom ?? [], linksTo: updated.linksTo ?? [] });
  };

  const removeLink = async (toId: string) => {
    await fetch(`/api/notes/${id}/links`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toId }),
    });
    const updated: Note = await fetch(`/api/notes/${id}`).then((r) => r.json());
    setNote({ ...updated, linksFrom: updated.linksFrom ?? [], linksTo: updated.linksTo ?? [] });
  };

  const createCategory = async () => {
    if (!newCatName.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName.trim(), color: newCatColor, parentId: newCatParent || null }),
    });
    const updated = await fetch("/api/categories").then((r) => r.json());
    setCategories(updated);
    setNewCatName("");
    setNewCatParent("");
  };

  if (!note) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>;
  }

  const connectedIds = new Set([
    ...note.linksFrom.map((l) => l.to.id),
    ...note.linksTo.map((l) => l.from.id),
    id,
  ]);
  const linkCandidates = allNotes.filter(
    (n) => !connectedIds.has(n.id) && n.title.toLowerCase().includes(linkSearch.toLowerCase())
  );
  const flatCats = flattenCategories(categories);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>

        {/* Category badge / picker trigger */}
        <button
          onClick={() => setShowCategoryPanel((v) => !v)}
          className="flex items-center gap-1.5 text-xs border rounded-full px-3 py-1 transition-colors"
          style={note.category
            ? { borderColor: note.category.color, color: note.category.color, backgroundColor: note.category.color + "18" }
            : { borderColor: "#cbd5e1", color: "#94a3b8" }
          }
        >
          <Tag size={12} />
          {note.category ? note.category.name : "No category"}
        </button>

        <span className="text-xs text-slate-400 ml-auto flex flex-col items-end gap-0.5">
          <span>{saving ? "Saving…" : "Saved"}</span>
          <span title="Created">
            {new Date(note.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </span>
        </span>

        {/* Preview toggle */}
        <button
          onClick={() => setPreview((v) => !v)}
          className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors ${
            preview ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-400"
          }`}
        >
          {preview ? <Pencil size={13} /> : <Eye size={13} />}
          {preview ? "Edit" : "Preview"}
        </button>


        <button onClick={deleteNote} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Title */}
      <input
        className="w-full text-2xl font-bold text-slate-900 bg-transparent border-none outline-none mb-4 placeholder:text-slate-300"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        readOnly={preview}
      />

      {/* Body: edit or preview */}
      {preview ? (
        <div className="max-w-none min-h-[60vh]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              p:          ({children}) => <p className="mb-4 leading-relaxed text-slate-700">{children}</p>,
              h1:         ({children}) => <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-3">{children}</h1>,
              h2:         ({children}) => <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">{children}</h2>,
              h3:         ({children}) => <h3 className="text-base font-semibold text-slate-800 mt-5 mb-1.5">{children}</h3>,
              ul:         ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-700">{children}</ul>,
              ol:         ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-slate-700">{children}</ol>,
              li:         ({children}) => <li className="leading-relaxed">{children}</li>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-500 my-4">{children}</blockquote>,
              code:       ({children}) => <code className="bg-slate-100 text-slate-800 rounded px-1 py-0.5 text-sm font-mono">{children}</code>,
              pre:        ({children}) => <pre className="bg-slate-100 rounded-lg p-4 overflow-x-auto mb-4 text-sm font-mono">{children}</pre>,
              hr:         () =>           <hr className="border-slate-200 my-6" />,
              a:          ({href, children}) => <a href={href} className="text-indigo-600 hover:underline">{children}</a>,
              strong:     ({children}) => <strong className="font-semibold text-slate-900">{children}</strong>,
            }}
          >{body || "*Nothing here yet.*"}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="w-full min-h-[60vh] text-slate-700 bg-transparent border-none outline-none resize-none text-base leading-relaxed placeholder:text-slate-300 font-mono"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing… (Markdown supported)"
        />
      )}

      {/* Category panel */}
      {showCategoryPanel && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Category</h3>
          <div className="flex flex-col gap-1 mb-4 max-h-48 overflow-y-auto">
            <button
              onClick={() => setCategory(null)}
              className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!note.categoryId ? "bg-slate-100 font-medium" : "hover:bg-slate-50 text-slate-600"}`}
            >
              No category
            </button>
            {flatCats.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`text-left text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${note.categoryId === c.id ? "font-medium" : "hover:bg-slate-50"}`}
                style={{ color: note.categoryId === c.id ? c.color : undefined }}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                {c.label}
              </button>
            ))}
          </div>

          {/* Create new category */}
          <div className="border border-slate-200 rounded-xl p-3 space-y-2">
            <p className="text-xs font-medium text-slate-500">New category</p>
            <input
              className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCategory()}
            />
            <select
              className="w-full text-sm bg-transparent outline-none text-slate-600"
              value={newCatParent}
              onChange={(e) => setNewCatParent(e.target.value)}
            >
              <option value="">No parent</option>
              {flatCats.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewCatColor(c)}
                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ background: c, borderColor: newCatColor === c ? "#0f172a" : "transparent" }}
                  />
                ))}
              </div>
              <button
                onClick={createCategory}
                className="ml-auto text-xs bg-slate-900 text-white rounded-lg px-3 py-1 hover:bg-slate-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connections panel */}
      <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Connections</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {note.linksFrom.map((l) => (
              <span key={l.to.id} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs rounded-full px-3 py-1">
                <Link href={`/note/${l.to.id}`} className="hover:underline">{l.to.title}</Link>
                <button onClick={() => removeLink(l.to.id)} className="hover:text-red-500"><X size={12} /></button>
              </span>
            ))}
            {note.linksTo.map((l) => (
              <span key={l.from.id} className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs rounded-full px-3 py-1">
                <Link href={`/note/${l.from.id}`} className="hover:underline">{l.from.title}</Link>
                <span className="text-slate-400 text-[10px]">← linked here</span>
              </span>
            ))}
            {note.linksFrom.length === 0 && note.linksTo.length === 0 && (
              <p className="text-xs text-slate-400">No connections yet.</p>
            )}
          </div>
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
      </div>
  );
}

