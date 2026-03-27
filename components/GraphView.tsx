"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { forceCollide } from "d3-force-3d";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

type GraphNode = { id: string; label: string; color: string; connections: number; x?: number; y?: number; z?: number };
type GraphLink = { source: string | GraphNode; target: string | GraphNode };
type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

const POSITIONS_KEY = "cortex-node-positions";
const SNAP_RADIUS = 28; // units in 3D space

function loadPositions(): Record<string, { x: number; y: number; z: number }> {
  try { return JSON.parse(localStorage.getItem(POSITIONS_KEY) ?? "{}"); } catch { return {}; }
}

function savePositions(nodes: { id: string; x?: number; y?: number; z?: number }[]) {
  const pos: Record<string, { x: number; y: number; z: number }> = {};
  for (const n of nodes) {
    if (n.x != null && n.y != null && n.z != null) pos[n.id] = { x: n.x, y: n.y, z: n.z };
  }
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(pos));
}

function nodeRadius(connections: number) {
  return 3 + Math.sqrt(connections + 1) * 2.5;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

// Custom d3 force: semantically dissimilar nodes repel harder, similar ones less so.
function forceSemanticRepulsion(
  similarityFn: (idA: string, idB: string) => number
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nodes: any[];

  function force(alpha: number) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i];
        const nj = nodes[j];

        const sim = similarityFn(ni.id, nj.id);
        // Dissimilarity [0,1]: fully opposite = 1, identical = 0
        const dissim = 1 - Math.max(0, sim);

        // Repulsion strength: baseline -60, up to -300 for opposing content
        const strength = -(60 + dissim * 240);

        const dx = (ni.x ?? 0) - (nj.x ?? 0);
        const dy = (ni.y ?? 0) - (nj.y ?? 0);
        const dz = (ni.z ?? 0) - (nj.z ?? 0);
        const dist2 = dx * dx + dy * dy + dz * dz || 1;
        const dist = Math.sqrt(dist2);
        const f = (strength * alpha) / dist2;

        ni.vx = (ni.vx ?? 0) + (f * dx) / dist;
        ni.vy = (ni.vy ?? 0) + (f * dy) / dist;
        ni.vz = (ni.vz ?? 0) + (f * dz) / dist;
        nj.vx = (nj.vx ?? 0) - (f * dx) / dist;
        nj.vy = (nj.vy ?? 0) - (f * dy) / dist;
        nj.vz = (nj.vz ?? 0) - (f * dz) / dist;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  force.initialize = (n: any[]) => { nodes = n; };
  return force;
}

interface GraphViewProps {
  highlightIds?: Set<string> | null;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  onSelectNote?: (id: string, title?: string) => void;
}

export function GraphView({ highlightIds, hoveredId, onHover, onSelectNote }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const graphDataRef = useRef<GraphData>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Embeddings: noteId → vector
  const embeddingsRef = useRef<Record<string, number[]>>({});
  // Precomputed similarity cache: "idA:idB" → similarity
  const simCacheRef = useRef<Record<string, number>>({});
  const [embeddingsReady, setEmbeddingsReady] = useState(false);

  // Drag-to-connect state
  const [snapTargetId, setSnapTargetId] = useState<string | null>(null);
  const dragSourceRef = useRef<GraphNode | null>(null);

  useEffect(() => setMounted(true), []);

  const getSimilarity = useCallback((idA: string, idB: string): number => {
    const key = idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
    if (simCacheRef.current[key] != null) return simCacheRef.current[key];
    const a = embeddingsRef.current[idA];
    const b = embeddingsRef.current[idB];
    if (!a || !b) return 0.5; // neutral if not yet computed
    const sim = cosineSimilarity(a, b);
    simCacheRef.current[key] = sim;
    return sim;
  }, []);

  const refreshGraph = useCallback(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((data: GraphData) => {
        const saved = loadPositions();
        const withPositions = {
          ...data,
          nodes: data.nodes.map((n) =>
            saved[n.id] ? { ...n, x: saved[n.id].x, y: saved[n.id].y, z: saved[n.id].z } : n
          ),
        };
        setGraphData(withPositions);
        graphDataRef.current = withPositions;
      });
  }, []);

  useEffect(() => { refreshGraph(); }, [refreshGraph]);

  // Fetch embeddings — runs in background, graph shows immediately
  useEffect(() => {
    fetch("/api/graph/embeddings")
      .then((r) => r.json())
      .then((data: Record<string, number[]>) => {
        embeddingsRef.current = data;
        simCacheRef.current = {}; // clear cache when embeddings update
        setEmbeddingsReady(true);
      })
      .catch(() => setEmbeddingsReady(false));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      setDimensions({ width: el.clientWidth, height: el.clientHeight });
    });
    obs.observe(el);
    setDimensions({ width: el.clientWidth, height: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!graphRef.current || graphData.nodes.length === 0) return;
    const fg = graphRef.current;

    // Disable default charge (we'll use semantic repulsion instead when ready)
    fg.d3Force("charge")?.strength(embeddingsReady ? 0 : -120);

    fg.d3Force("link")?.distance(60);
    fg.d3Force(
      "collision",
      forceCollide()
        .radius((n: unknown) => nodeRadius((n as GraphNode).connections) + 8)
        .strength(1)
        .iterations(2)
    );

    if (embeddingsReady) {
      fg.d3Force("semanticRepulsion", forceSemanticRepulsion(getSimilarity));
    } else {
      fg.d3Force("semanticRepulsion", null);
    }

    const hasPositions = graphData.nodes.some((n) => n.x != null);
    if (!hasPositions) fg.d3ReheatSimulation();
  }, [graphData, embeddingsReady, getSimilarity]);

  // Re-apply semantic force when embeddings arrive (reheat gently)
  useEffect(() => {
    if (!embeddingsReady || !graphRef.current) return;
    const fg = graphRef.current;
    fg.d3Force("charge")?.strength(0);
    fg.d3Force("semanticRepulsion", forceSemanticRepulsion(getSimilarity));
    fg.d3ReheatSimulation();
  }, [embeddingsReady, getSimilarity]);

  const handleEngineStop = useCallback(() => {
    savePositions(graphDataRef.current.nodes);
  }, []);

  const handleBackgroundClick = useCallback(async () => {
    if (creating) return;
    const fg = graphRef.current;
    if (!fg) return;
    setCreating(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled" }),
    });
    const note = await res.json();
    setCreating(false);
    const newNode = { id: note.id, label: note.title, color: "#6366f1", connections: 0 };
    setGraphData((prev) => {
      const next = { ...prev, nodes: [...prev.nodes, newNode] };
      graphDataRef.current = next;
      return next;
    });
    onSelectNote?.(note.id);
  }, [creating, onSelectNote]);

  // Drag-to-connect handlers
  const handleNodeDrag = useCallback((node: unknown) => {
    const n = node as GraphNode;
    dragSourceRef.current = n;

    let nearest: GraphNode | null = null;
    let nearestDist = SNAP_RADIUS;

    for (const other of graphDataRef.current.nodes) {
      if (other.id === n.id) continue;
      const dx = (other.x ?? 0) - (n.x ?? 0);
      const dy = (other.y ?? 0) - (n.y ?? 0);
      const dz = (other.z ?? 0) - (n.z ?? 0);
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = other;
      }
    }

    setSnapTargetId(nearest?.id ?? null);
  }, []);

  const handleNodeDragEnd = useCallback(async (node: unknown) => {
    const n = node as GraphNode;
    const target = snapTargetId;
    setSnapTargetId(null);
    dragSourceRef.current = null;

    if (!target || target === n.id) return;

    // Check if link already exists (to toggle off)
    const existingLink = graphDataRef.current.links.find((l) => {
      const srcId = typeof l.source === "object" ? (l.source as GraphNode).id : String(l.source);
      const tgtId = typeof l.target === "object" ? (l.target as GraphNode).id : String(l.target);
      return (srcId === n.id && tgtId === target) || (srcId === target && tgtId === n.id);
    });

    if (existingLink) {
      // De-snap: remove the link
      const srcId = typeof existingLink.source === "object" ? (existingLink.source as GraphNode).id : String(existingLink.source);
      await fetch(`/api/notes/${srcId}/links`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: typeof existingLink.target === "object" ? (existingLink.target as GraphNode).id : String(existingLink.target) }),
      });
    } else {
      // Snap: create the link
      await fetch(`/api/notes/${n.id}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: target }),
      });
    }

    refreshGraph();
  }, [snapTargetId, refreshGraph]);

  const handleLinkClick = useCallback(async (link: unknown) => {
    const l = link as GraphLink;
    const srcId = typeof l.source === "object" ? (l.source as GraphNode).id : String(l.source);
    const tgtId = typeof l.target === "object" ? (l.target as GraphNode).id : String(l.target);
    if (!confirm(`Remove connection between these two notes?`)) return;
    await fetch(`/api/notes/${srcId}/links`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toId: tgtId }),
    });
    refreshGraph();
  }, [refreshGraph]);

  const isFiltering = highlightIds != null;

  return (
    <div ref={containerRef} className="flex-1 w-full h-full bg-slate-900 relative">
      <ForceGraph3D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="#0f172a"
        nodeLabel="label"
        nodeVal={(node) => {
          const n = node as GraphNode;
          const r = nodeRadius(n.connections);
          return r * r;
        }}
        nodeColor={(node) => {
          const n = node as GraphNode;
          const isHovered = n.id === hoveredId;
          const isSnapping = n.id === snapTargetId;
          if (isSnapping) return "#facc15"; // yellow highlight during drag-snap
          const dimmed = (isFiltering && !highlightIds!.has(n.id)) || (hoveredId != null && !isHovered);
          if (dimmed) return "#1e293b";
          if (isHovered) return "#ffffff";
          return n.color;
        }}
        nodeOpacity={0.92}
        linkColor={(link) => {
          if (!isFiltering) return "#334155";
          const srcId = typeof link.source === "object" ? (link.source as GraphNode).id : String(link.source ?? "");
          const tgtId = typeof link.target === "object" ? (link.target as GraphNode).id : String(link.target ?? "");
          return highlightIds!.has(srcId) && highlightIds!.has(tgtId) ? "#475569" : "#0f172a";
        }}
        linkWidth={0.8}
        linkOpacity={0.4}
        onNodeClick={(node) => onSelectNote?.((node as GraphNode).id, (node as GraphNode).label)}
        onNodeDrag={handleNodeDrag}
        onNodeDragEnd={handleNodeDragEnd}
        onLinkClick={handleLinkClick}
        onBackgroundClick={handleBackgroundClick}
        onNodeHover={(node) => onHover?.((node as GraphNode | null)?.id ?? null)}
        onEngineStop={handleEngineStop}
      />

      {/* Status indicators */}
      {mounted && graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-400 text-sm">Tap anywhere to add your first note.</p>
        </div>
      )}
      {creating && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full pointer-events-none">
          Creating…
        </div>
      )}
      {!embeddingsReady && graphData.nodes.length > 0 && (
        <div className="absolute top-3 right-3 bg-slate-800/80 text-slate-400 text-xs px-3 py-1.5 rounded-full pointer-events-none">
          Computing semantic layout… (first run downloads ~22 MB)
        </div>
      )}
      {snapTargetId && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-xs px-3 py-1.5 rounded-full pointer-events-none font-medium">
          Release to snap / unsnap connection
        </div>
      )}
    </div>
  );
}
