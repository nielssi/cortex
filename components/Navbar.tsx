"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Plus } from "lucide-react";

export function Navbar() {
  const router = useRouter();

  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled" }),
    });
    const note = await res.json();
    router.push(`/note/${note.id}`);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Brain size={20} className="text-indigo-600" />
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Cortex
          </span>
        </Link>
        <button
          onClick={createNote}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          <Plus size={16} /> New note
        </button>
      </div>
    </header>
  );
}
