"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Plus, Download, Upload } from "lucide-react";

type NoteStub = { id: string; title: string; createdAt: string; updatedAt: string; categoryId: string | null };
type Category = { id: string; name: string; color: string; children: Category[] };

function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children ?? [])]);
}

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  onFilterChange: (matchingIds: Set<string> | null) => void;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  selectedNoteId?: string | null;
  onSelectNote?: (id: string) => void;
}

export function Sidebar({ open, onToggle, onFilterChange, hoveredId, onHover, selectedNoteId, onSelectNote }: SidebarProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteStub[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/notes").then((r) => r.json()).then(setNotes);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const computeFilter = useCallback((q: string, activeCats: Set<string>, allNotes: NoteStub[]) => {
    const hasQuery = q.trim().length > 0;
    const hasCatFilter = activeCats.size > 0;
    if (!hasQuery && !hasCatFilter) { onFilterChange(null); return; }

    const matching = allNotes.filter((n) => {
      const matchesQuery = !hasQuery || n.title.toLowerCase().includes(q.toLowerCase());
      const matchesCat = !hasCatFilter || (n.categoryId !== null && activeCats.has(n.categoryId));
      return matchesQuery && matchesCat;
    });
    onFilterChange(new Set(matching.map((n) => n.id)));
  }, [onFilterChange]);

  const handleQuery = (q: string) => {
    setQuery(q);
    computeFilter(q, activeCategories, notes);
  };

  const toggleCategory = (id: string) => {
    const next = new Set(activeCategories);
    next.has(id) ? next.delete(id) : next.add(id);
    setActiveCategories(next);
    computeFilter(query, next, notes);
  };

  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled" }),
    });
    const note = await res.json();
    const fresh = await fetch("/api/notes").then((r) => r.json());
    setNotes(fresh);
    onSelectNote?.(note.id);
  };

  const flat = flattenCategories(categories);

  const visibleNotes = notes.filter((n) => {
    const matchesQuery = !query.trim() || n.title.toLowerCase().includes(query.toLowerCase());
    const matchesCat = activeCategories.size === 0 || (n.categoryId !== null && activeCategories.has(n.categoryId));
    return matchesQuery && matchesCat;
  });

  if (!open) {
    return (
      <div className="flex flex-col items-center w-10 border-r border-slate-200 bg-white py-3 gap-3 shrink-0">
        <button onClick={onToggle} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-100">
        <button
          onClick={createNote}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <Plus size={14} /> New note
        </button>
        <button onClick={onToggle} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400"
            placeholder="Search…"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 py-3 border-b border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Categories</p>
        <div className="flex flex-col gap-1">
          {flat.map((c) => {
            const active = activeCategories.has(c.id);
            const count = notes.filter((n) => n.categoryId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => toggleCategory(c.id)}
                className="flex items-center gap-2 text-sm px-2 py-1 rounded-lg transition-colors text-left"
                style={active ? { backgroundColor: c.color + "18", color: c.color } : { color: "#475569" }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: active ? c.color : "#cbd5e1" }}
                />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-[11px] text-slate-400">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {query || activeCategories.size > 0 ? `${visibleNotes.length} results` : "Recent"}
        </p>
        <div className="flex flex-col gap-0.5">
          {visibleNotes.slice(0, 50).map((n) => {
            const cat = flat.find((c) => c.id === n.categoryId);
            const isSelected = n.id === selectedNoteId;
            return (
              <button
                key={n.id}
                onClick={() => onSelectNote?.(n.id, n.title)}
                onMouseEnter={() => onHover?.(n.id)}
                onMouseLeave={() => onHover?.(null)}
                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group ${isSelected ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                style={{ opacity: hoveredId && hoveredId !== n.id ? 0.2 : 1 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: cat?.color ?? "#cbd5e1" }}
                />
                <span className="flex-1 min-w-0">
                  <span className={`block text-sm truncate ${isSelected ? "text-indigo-700 font-medium" : "text-slate-700 group-hover:text-slate-900"}`}>{n.title}</span>
                  <span className="block text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </span>
              </button>
            );
          })}
          {visibleNotes.length === 0 && (
            <p className="text-xs text-slate-400 px-2">No notes found.</p>
          )}
        </div>
      </div>

      {/* Footer: export / import */}
      <div className="border-t border-slate-100 px-3 py-2 flex items-center gap-2">
        <a
          href="/api/export"
          download
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          title="Export all notes"
        >
          <Download size={13} /> Export
        </a>
        <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer ml-auto" title="Import from export file">
          <Upload size={13} /> Import
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              const res = await fetch("/api/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: text,
              });
              const result = await res.json();
              if (result.ok) {
                alert(`Imported ${result.imported.notes} notes, ${result.imported.categories} categories.`);
                window.location.reload();
              } else {
                alert(`Import failed: ${result.error}`);
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </aside>
  );
}
