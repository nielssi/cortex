"use client";

import { useState, useCallback } from "react";
import { GraphView } from "@/components/GraphView";
import { Sidebar } from "@/components/Sidebar";
import { NotePanel } from "@/components/NotePanel";
import { TabBar } from "@/components/TabBar";

type OpenNote = { id: string; title: string };

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightIds, setHighlightIds] = useState<Set<string> | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openNotes, setOpenNotes] = useState<OpenNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0);

  const handleSelectNote = useCallback((id: string, title = "Loading…") => {
    setActiveNoteId(id);
    setOpenNotes((prev) => {
      if (prev.find((n) => n.id === id)) return prev;
      return [...prev, { id, title }];
    });
  }, []);

  const handleCloseTab = useCallback((id: string) => {
    setOpenNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      setActiveNoteId((cur) => {
        if (cur !== id) return cur;
        const idx = prev.findIndex((n) => n.id === id);
        return next[Math.max(0, idx - 1)]?.id ?? next[0]?.id ?? null;
      });
      return next;
    });
  }, []);

  const handleDeleted = useCallback(() => {
    if (activeNoteId) handleCloseTab(activeNoteId);
    setSidebarKey((k) => k + 1);
  }, [activeNoteId, handleCloseTab]);

  const handleSaved = useCallback(() => {
    setSidebarKey((k) => k + 1);
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setOpenNotes((prev) =>
      prev.map((n) => (n.id === activeNoteId ? { ...n, title } : n))
    );
  }, [activeNoteId]);

  const panelOpen = openNotes.length > 0;

  return (
    <main className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      <Sidebar
        key={sidebarKey}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onFilterChange={setHighlightIds}
        hoveredId={hoveredId}
        selectedNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
      />

      {panelOpen && (
        <div className="w-[420px] shrink-0 border-r border-slate-200 flex flex-col overflow-hidden bg-white">
          <TabBar
            tabs={openNotes}
            activeId={activeNoteId}
            onActivate={setActiveNoteId}
            onClose={handleCloseTab}
          />
          {activeNoteId && (
            <NotePanel
              key={activeNoteId}
              id={activeNoteId}
              onClose={() => handleCloseTab(activeNoteId)}
              onDeleted={handleDeleted}
              onSelectNote={handleSelectNote}
              onSaved={handleSaved}
              onTitleChange={handleTitleChange}
            />
          )}
        </div>
      )}

      <GraphView
        highlightIds={highlightIds}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        onSelectNote={handleSelectNote}
      />
    </main>
  );
}
