"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Trash2, X, Eye, Pencil, Tag } from "lucide-react";

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

const CALLOUT_ICONS: Record<string, string> = {
  note: "💡", tip: "✅", info: "ℹ️", warning: "⚠️",
  caution: "⚠️", danger: "🚨", important: "📌",
};

function flattenCategories(cats: Category[], prefix = ""): { id: string; label: string; color: string }[] {
  return cats.flatMap((c) => [
    { id: c.id, label: prefix + c.name, color: c.color },
    ...flattenCategories(c.children ?? [], prefix + c.name + " › "),
  ]);
}

// Replace > [!TYPE] Title with a styled blockquote prefix
function preprocessCallouts(body: string): string {
  return body.replace(
    /^> \[!(NOTE|TIP|INFO|WARNING|CAUTION|DANGER|IMPORTANT)\]\s*(.*)/gim,
    (_, type, title) => {
      const icon = CALLOUT_ICONS[type.toLowerCase()] ?? "📝";
      return `> **${icon} ${title.trim() || type.toUpperCase()}**`;
    }
  );
}

// Convert [[title]] and ![[title]] to markdown links / embed markers
function preprocessWikilinks(
  body: string,
  noteMap: Record<string, string>,
  embeddedNotes: Record<string, { title: string; body: string }>
): string {
  // Embeds first: ![[title]]
  let result = body.replace(/!\[\[([^\]]+)\]\]/g, (_, rawTitle) => {
    const titleKey = rawTitle.trim().split("#")[0].trim();
    const embId = noteMap[titleKey];
    const embedded = embId ? embeddedNotes[embId] : null;
    if (embedded) {
      const indented = embedded.body.split("\n").map((l: string) => `> ${l}`).join("\n");
      return `\n> **📎 ${embedded.title}**\n>\n${indented}\n`;
    }
    return `> *📎 [[${rawTitle}]] — loading…*`;
  });

  // Wikilinks: [[title]] or [[title#Heading]]
  result = result.replace(/\[\[([^\]]+)\]\]/g, (_, rawTitle) => {
    const [titlePart, anchor] = rawTitle.split("#");
    const noteId = noteMap[titlePart.trim()];
    const display = rawTitle.trim();
    const href = noteId
      ? `cortex-note://${noteId}${anchor ? "#" + anchor.trim() : ""}`
      : `cortex-note://unresolved`;
    return `[${display}](${href})`;
  });

  return result;
}

interface NotePanelProps {
  id: string;
  onClose: () => void;
  onDeleted: () => void;
  onSelectNote: (id: string, title?: string) => void;
  onSaved?: () => void;
  onTitleChange?: (title: string) => void;
}

export function NotePanel({ id, onClose, onDeleted, onSelectNote, onSaved, onTitleChange }: NotePanelProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [allNotes, setAllNotes] = useState<NoteStub[]>([]);
  const [linkSearch, setLinkSearch] = useState("");
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [preview, setPreview] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const [newCatParent, setNewCatParent] = useState<string>("");

  // Wikilink autocomplete
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wikilinkQuery, setWikilinkQuery] = useState<string | null>(null);

  // Embedded note content cache
  const [embeddedNotes, setEmbeddedNotes] = useState<Record<string, { title: string; body: string }>>({});

  useEffect(() => {
    setNote(null);
    setTitle("");
    setBody("");
    setPreview(false);
    setShowCategoryPanel(false);
    setLinkSearch("");
    setWikilinkQuery(null);
    setEmbeddedNotes({});
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then((n: Note) => {
        setNote({ ...n, linksFrom: n.linksFrom ?? [], linksTo: n.linksTo ?? [] });
        setTitle(n.title);
        setBody(n.body);
        onTitleChange?.(n.title);
      });
    fetch("/api/notes").then((r) => r.json()).then(setAllNotes);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const noteMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const n of allNotes) m[n.title] = n.id;
    return m;
  }, [allNotes]);

  // Fetch embedded note content whenever body changes
  useEffect(() => {
    const matches = [...body.matchAll(/!\[\[([^\]]+)\]\]/g)];
    const titles = [...new Set(matches.map((m) => m[1].trim().split("#")[0].trim()))];
    for (const t of titles) {
      const embId = noteMap[t];
      if (embId && embId !== id && !embeddedNotes[embId]) {
        fetch(`/api/notes/${embId}`)
          .then((r) => r.json())
          .then((n: Note) => {
            setEmbeddedNotes((prev) => ({ ...prev, [embId]: { title: n.title, body: n.body } }));
          });
      }
    }
  }, [body, noteMap, id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    onSaved?.();
    if (patch.title) onTitleChange?.(patch.title);
  }, [id, onSaved, onTitleChange]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => save({ title, body }), 1200);
    return () => clearTimeout(t);
  }, [title, body, note, save]);

  // Wikilink autocomplete detection
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBody(val);
    const cursor = e.target.selectionStart ?? 0;
    const before = val.slice(0, cursor);
    const lastOpen = before.lastIndexOf("[[");
    const lastClose = before.lastIndexOf("]]");
    if (lastOpen !== -1 && lastOpen > lastClose) {
      const afterOpen = before.slice(lastOpen + 2);
      if (!afterOpen.includes("\n")) {
        setWikilinkQuery(afterOpen);
        return;
      }
    }
    setWikilinkQuery(null);
  };

  const insertWikilink = (n: NoteStub) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart ?? 0;
    const before = body.slice(0, cursor);
    const lastOpen = before.lastIndexOf("[[");
    const newBody = body.slice(0, lastOpen) + `[[${n.title}]]` + body.slice(cursor);
    setBody(newBody);
    setWikilinkQuery(null);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = lastOpen + n.title.length + 4;
      ta.setSelectionRange(pos, pos);
    });
  };

  const setCategory = (categoryId: string | null) => {
    save({ categoryId });
    setShowCategoryPanel(false);
  };

  const deleteNote = async () => {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    onDeleted();
  };

  const addLink = async (toId: string) => {
    await fetch(`/api/notes/${id}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toId }),
    });
    const updated: Note = await fetch(`/api/notes/${id}`).then((r) => r.json());
    setNote({ ...updated, linksFrom: updated.linksFrom ?? [], linksTo: updated.linksTo ?? [] });
    setLinkSearch("");
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

  const flatCats = flattenCategories(categories);

  const connectedIds = note
    ? new Set([...note.linksFrom.map((l) => l.to.id), ...note.linksTo.map((l) => l.from.id), id])
    : new Set([id]);

  const linkCandidates = allNotes.filter(
    (n) => !connectedIds.has(n.id) && n.title.toLowerCase().includes(linkSearch.toLowerCase())
  );

  // Wikilink autocomplete candidates (exclude self)
  const wikilinkCandidates = wikilinkQuery !== null
    ? allNotes.filter((n) => n.id !== id && n.title.toLowerCase().includes(wikilinkQuery.toLowerCase())).slice(0, 8)
    : [];

  // Processed body for preview
  const previewBody = useMemo(() => {
    if (!preview) return body;
    let processed = preprocessCallouts(body);
    processed = preprocessWikilinks(processed, noteMap, embeddedNotes);
    return processed;
  }, [preview, body, noteMap, embeddedNotes]);

  // Markdown components — shared between preview modes
  const markdownComponents = useMemo(() => ({
    p:          ({children}: React.PropsWithChildren) => <p className="mb-4 leading-relaxed text-slate-700">{children}</p>,
    h1:         ({children}: React.PropsWithChildren) => <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-3">{children}</h1>,
    h2:         ({children}: React.PropsWithChildren) => <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">{children}</h2>,
    h3:         ({children}: React.PropsWithChildren) => <h3 className="text-base font-semibold text-slate-800 mt-5 mb-1.5">{children}</h3>,
    ul:         ({children}: React.PropsWithChildren) => <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-700">{children}</ul>,
    ol:         ({children}: React.PropsWithChildren) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-slate-700">{children}</ol>,
    li:         ({children}: React.PropsWithChildren) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({children}: React.PropsWithChildren) => <blockquote className="border-l-4 border-indigo-300 pl-4 bg-indigo-50/50 py-1 rounded-r-lg my-4 text-slate-600">{children}</blockquote>,
    code:       ({children}: React.PropsWithChildren) => <code className="bg-slate-100 text-slate-800 rounded px-1 py-0.5 text-sm font-mono">{children}</code>,
    pre:        ({children}: React.PropsWithChildren) => <pre className="bg-slate-100 rounded-lg p-4 overflow-x-auto mb-4 text-sm font-mono">{children}</pre>,
    hr:         () => <hr className="border-slate-200 my-6" />,
    table:      ({children}: React.PropsWithChildren) => <div className="overflow-x-auto mb-4"><table className="min-w-full text-sm border-collapse">{children}</table></div>,
    th:         ({children}: React.PropsWithChildren) => <th className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-left font-semibold text-slate-700">{children}</th>,
    td:         ({children}: React.PropsWithChildren) => <td className="border border-slate-200 px-3 py-1.5 text-slate-700">{children}</td>,
    strong:     ({children}: React.PropsWithChildren) => <strong className="font-semibold text-slate-900">{children}</strong>,
    a: ({ href, children }: React.PropsWithChildren<{ href?: string }>) => {
      if (href?.startsWith("cortex-note://")) {
        const rest = href.slice("cortex-note://".length);
        if (rest === "unresolved") {
          return <span className="text-rose-400 underline decoration-dashed cursor-not-allowed" title="Note not found">{children}</span>;
        }
        const noteId = rest.split("#")[0];
        const noteTitle = allNotes.find((n) => n.id === noteId)?.title ?? noteId;
        return (
          <button
            onClick={() => onSelectNote(noteId, noteTitle)}
            className="text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            {children}
          </button>
        );
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{children}</a>;
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [allNotes, onSelectNote]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-wrap shrink-0">
        {note && (
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
        )}

        <span className="text-xs text-slate-400 ml-auto flex flex-col items-end gap-0.5">
          <span>{saving ? "Saving…" : "Saved"}</span>
          {note && (
            <span title="Created">
              {new Date(note.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          )}
        </span>

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
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!note ? (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Loading…</div>
        ) : (
          <>
            {/* Title */}
            <input
              className="w-full text-xl font-bold text-slate-900 bg-transparent border-none outline-none mb-4 placeholder:text-slate-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              readOnly={preview}
            />

            {/* Body */}
            {preview ? (
              <div className="min-h-[40vh]">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                  {previewBody || "*Nothing here yet.*"}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  className="w-full min-h-[40vh] text-slate-700 bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder:text-slate-300 font-mono"
                  value={body}
                  onChange={handleBodyChange}
                  onKeyDown={(e) => {
                    if (wikilinkQuery !== null) {
                      if (e.key === "Escape") { e.preventDefault(); setWikilinkQuery(null); }
                      if (e.key === "Enter" && wikilinkCandidates.length === 1) {
                        e.preventDefault();
                        insertWikilink(wikilinkCandidates[0]);
                      }
                    }
                  }}
                  placeholder={`Start writing… (Markdown supported)\n\nTip: type [[ to link another note, ![[  to embed it`}
                />

                {/* Wikilink autocomplete dropdown */}
                {wikilinkQuery !== null && (
                  <div className="absolute right-0 top-0 z-20 bg-white border border-slate-200 rounded-xl shadow-xl w-64">
                    <div className="px-3 py-2 text-[11px] text-slate-400 border-b border-slate-100 font-medium">
                      Link note → <span className="font-mono text-indigo-500">[[{wikilinkQuery}]]</span>
                    </div>
                    {wikilinkCandidates.length > 0 ? (
                      wikilinkCandidates.map((n) => (
                        <button
                          key={n.id}
                          onMouseDown={(e) => { e.preventDefault(); insertWikilink(n); }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {n.title}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-xs text-slate-400">No matching notes</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Category panel */}
            {showCategoryPanel && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Category</h3>
                <div className="flex flex-col gap-1 mb-4 max-h-40 overflow-y-auto">
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

            {/* Connections */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Connections</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {note.linksFrom.map((l) => (
                  <span key={l.to.id} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs rounded-full px-3 py-1">
                    <button onClick={() => onSelectNote(l.to.id, l.to.title)} className="hover:underline">{l.to.title}</button>
                    <button onClick={() => removeLink(l.to.id)} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                ))}
                {note.linksTo.map((l) => (
                  <span key={l.from.id} className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs rounded-full px-3 py-1">
                    <button onClick={() => onSelectNote(l.from.id, l.from.title)} className="hover:underline">{l.from.title}</button>
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
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {linkCandidates.slice(0, 10).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => addLink(n.id)}
                      className="text-left text-sm text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg px-2 py-1 transition-colors"
                    >
                      {n.title}
                    </button>
                  ))}
                  {linkCandidates.length === 0 && linkSearch && (
                    <p className="text-xs text-slate-400 px-2">No matching notes.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
