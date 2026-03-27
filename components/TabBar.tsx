"use client";

import { X } from "lucide-react";

interface Tab { id: string; title: string }

interface TabBarProps {
  tabs: Tab[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
}

export function TabBar({ tabs, activeId, onActivate, onClose }: TabBarProps) {
  if (tabs.length === 0) return null;
  return (
    <div className="flex items-end overflow-x-auto shrink-0 bg-slate-50 border-b border-slate-200">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            onClick={() => onActivate(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 cursor-pointer shrink-0 max-w-44 group select-none ${
              active
                ? "bg-white text-slate-900 border-b-2 border-b-indigo-500 -mb-px"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <span className="text-xs truncate flex-1 min-w-0">
              {tab.title || "Untitled"}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
              className={`shrink-0 rounded transition-colors ${
                active ? "text-slate-400 hover:text-red-500" : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
              }`}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
