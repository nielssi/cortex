"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { forceCollide } from "d3-force-3d";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

const SPHERE_RADIUS = 140;
const SNAP_RADIUS = 45;

type GraphNode = { id: string; label: string; color: string; connections: number; x?: number; y?: number; z?: number };
type GraphLink = { source: string | GraphNode; target: string | GraphNode };
type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

const POSITIONS_KEY = "cortex-node-positions";

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

function projectToSphere(x: number, y: number, z: number): { x: number; y: number; z: number } {
  const dist = Math.sqrt(x * x + y * y + z * z) || 1;
  return { x: (x / dist) * SPHERE_RADIUS, y: (y / dist) * SPHERE_RADIUS, z: (z / dist) * SPHERE_RADIUS };
}

function randomOnSphere(): { x: number; y: number; z: number } {
  const u = Math.random() * 2 - 1;
  const t = Math.random() * 2 * Math.PI;
  const r = Math.sqrt(1 - u * u);
  return { x: r * Math.cos(t) * SPHERE_RADIUS, y: r * Math.sin(t) * SPHERE_RADIUS, z: u * SPHERE_RADIUS };
}

function nodeRadius(connections: number) {
  return 3 + Math.sqrt(connections + 1) * 2.5;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// Hard sphere surface constraint: projects positions onto sphere and strips
// the radial velocity component so nodes can only move tangentially.
function forceSphereConstraint() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nodes: any[];
  function force() {
    for (const n of nodes) {
      const x = n.x ?? 0.001, y = n.y ?? 0, z = n.z ?? 0;
      const dist = Math.sqrt(x * x + y * y + z * z) || 0.001;
      const inv = SPHERE_RADIUS / dist;
      n.x = x * inv; n.y = y * inv; n.z = z * inv;
      // Unit normal at this point on sphere
      const nx = n.x / SPHERE_RADIUS, ny = n.y / SPHERE_RADIUS, nz = n.z / SPHERE_RADIUS;
      const vx = n.vx ?? 0, vy = n.vy ?? 0, vz = n.vz ?? 0;
      const radial = vx * nx + vy * ny + vz * nz;
      n.vx = vx - radial * nx;
      n.vy = vy - radial * ny;
      n.vz = vz - radial * nz;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  force.initialize = (n: any[]) => { nodes = n; };
  return force;
}

// Semantic repulsion: dissimilar notes repel harder, causing them to drift
// to opposite regions of the sphere surface.
function forceSemanticRepulsion(similarityFn: (a: string, b: string) => number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nodes: any[];
  function force(alpha: number) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        const sim = similarityFn(ni.id, nj.id);
        const strength = -(50 + (1 - Math.max(0, sim)) * 200);
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
  const sphereAddedRef = useRef(false);

  const embeddingsRef = useRef<Record<string, number[]>>({});
  const simCacheRef = useRef<Record<string, number>>({});
  const [embeddingsReady, setEmbeddingsReady] = useState(false);

  const [snapTargetId, setSnapTargetId] = useState<string | null>(null);
  const snapTargetIdRef = useRef<string | null>(null);
  const dragSourceRef = useRef<GraphNode | null>(null);

  useEffect(() => setMounted(true), []);

  const getSimilarity = useCallback((idA: string, idB: string): number => {
    const key = idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
    if (simCacheRef.current[key] != null) return simCacheRef.current[key];
    const a = embeddingsRef.current[idA];
    const b = embeddingsRef.current[idB];
    if (!a || !b) return 0.5;
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
            saved[n.id]
              ? { ...n, ...projectToSphere(saved[n.id].x, saved[n.id].y, saved[n.id].z) }
              : { ...n, ...randomOnSphere() }
          ),
        };
        setGraphData(withPositions);
        graphDataRef.current = withPositions;
      });
  }, []);

  useEffect(() => { refreshGraph(); }, [refreshGraph]);

  useEffect(() => {
    fetch("/api/graph/embeddings")
      .then((r) => r.json())
      .then((data: Record<string, number[]>) => {
        embeddingsRef.current = data;
        simCacheRef.current = {};
        setEmbeddingsReady(true);
      })
      .catch(() => setEmbeddingsReady(false));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setDimensions({ width: el.clientWidth, height: el.clientHeight }));
    obs.observe(el);
    setDimensions({ width: el.clientWidth, height: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  // Apply forces — sphere constraint runs last so it cleans up after all other forces
  useEffect(() => {
    if (!graphRef.current || graphData.nodes.length === 0) return;
    const fg = graphRef.current;
    fg.d3Force("charge", null);       // replaced by semantic repulsion
    fg.d3Force("center", null);       // don't fight the sphere constraint
    fg.d3Force("link")?.distance(90);
    fg.d3Force("collision", forceCollide()
      .radius((n: unknown) => nodeRadius((n as GraphNode).connections) + 20)
      .strength(0.9)
      .iterations(3)
    );
    if (embeddingsReady) {
      fg.d3Force("semanticRepulsion", forceSemanticRepulsion(getSimilarity));
    }
    // Sphere constraint runs last — AFTER all other forces modify velocities
    fg.d3Force("sphereConstraint", forceSphereConstraint());
    fg.d3ReheatSimulation();
  }, [graphData.nodes.length, embeddingsReady, getSimilarity]);

  useEffect(() => {
    if (!embeddingsReady || !graphRef.current) return;
    graphRef.current.d3Force("semanticRepulsion", forceSemanticRepulsion(getSimilarity));
    graphRef.current.d3ReheatSimulation();
  }, [embeddingsReady, getSimilarity]);

  // Add transparent sphere shell to the Three.js scene
  useEffect(() => {
    if (!mounted || graphData.nodes.length === 0 || sphereAddedRef.current) return;
    sphereAddedRef.current = true;

    const timer = setTimeout(() => {
      const fg = graphRef.current;
      if (!fg?.scene) return;
      const scene = fg.scene();
      if (!scene) return;

      import("three").then(({ SphereGeometry, MeshBasicMaterial, Mesh, BackSide }) => {
        // Subtle filled inner shell
        const geoShell = new SphereGeometry(SPHERE_RADIUS, 48, 32);
        const matShell = new MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.18, side: BackSide });
        const shell = new Mesh(geoShell, matShell);

        // Sparse latitude/longitude wireframe
        const geoWire = new SphereGeometry(SPHERE_RADIUS + 0.5, 18, 12);
        const matWire = new MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.18, wireframe: true });
        const wire = new Mesh(geoWire, matWire);

        scene.add(shell);
        scene.add(wire);

        // Pull camera back so the whole sphere is comfortably in view
        fg.cameraPosition({ x: 0, y: 0, z: SPHERE_RADIUS * 2.8 });
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [mounted, graphData.nodes.length]);

  const handleEngineStop = useCallback(() => {
    savePositions(graphDataRef.current.nodes);
  }, []);

  const handleBackgroundClick = useCallback(async () => {
    if (creating) return;
    if (!graphRef.current) return;
    setCreating(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled" }),
    });
    const note = await res.json();
    setCreating(false);
    const newNode = { id: note.id, label: note.title, color: "#6366f1", connections: 0, ...randomOnSphere() };
    setGraphData((prev) => {
      const next = { ...prev, nodes: [...prev.nodes, newNode] };
      graphDataRef.current = next;
      return next;
    });
    onSelectNote?.(note.id);
  }, [creating, onSelectNote]);

  const handleNodeDrag = useCallback((node: unknown) => {
    const n = node as GraphNode;
    dragSourceRef.current = n;

    // Keep dragged node on the sphere surface
    if (n.x != null && n.y != null && n.z != null) {
      const p = projectToSphere(n.x, n.y, n.z);
      n.x = p.x; n.y = p.y; n.z = p.z;
    }

    let nearest: GraphNode | null = null;
    let nearestDist = SNAP_RADIUS;
    for (const other of graphDataRef.current.nodes) {
      if (other.id === n.id) continue;
      const dx = (other.x ?? 0) - (n.x ?? 0);
      const dy = (other.y ?? 0) - (n.y ?? 0);
      const dz = (other.z ?? 0) - (n.z ?? 0);
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < nearestDist) { nearestDist = dist; nearest = other; }
    }
    snapTargetIdRef.current = nearest?.id ?? null;
    setSnapTargetId(nearest?.id ?? null);
  }, []);

  const handleNodeDragEnd = useCallback(async (node: unknown) => {
    const n = node as GraphNode;
    const target = snapTargetIdRef.current;
    snapTargetIdRef.current = null;
    setSnapTargetId(null);
    dragSourceRef.current = null;
    if (!target || target === n.id) return;

    const existingLink = graphDataRef.current.links.find((l) => {
      const s = typeof l.source === "object" ? (l.source as GraphNode).id : String(l.source);
      const t = typeof l.target === "object" ? (l.target as GraphNode).id : String(l.target);
      return (s === n.id && t === target) || (s === target && t === n.id);
    });

    if (existingLink) {
      const srcId = typeof existingLink.source === "object" ? (existingLink.source as GraphNode).id : String(existingLink.source);
      const tgtId = typeof existingLink.target === "object" ? (existingLink.target as GraphNode).id : String(existingLink.target);
      await fetch(`/api/notes/${srcId}/links`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: tgtId }),
      });
    } else {
      await fetch(`/api/notes/${n.id}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: target }),
      });
    }
    refreshGraph();
  }, [refreshGraph]);

  const handleLinkClick = useCallback(async (link: unknown) => {
    const l = link as GraphLink;
    const srcId = typeof l.source === "object" ? (l.source as GraphNode).id : String(l.source);
    const tgtId = typeof l.target === "object" ? (l.target as GraphNode).id : String(l.target);
    if (!confirm("Remove connection between these two notes?")) return;
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
        nodeVal={(node) => { const r = nodeRadius((node as GraphNode).connections); return r * r; }}
        nodeColor={(node) => {
          const n = node as GraphNode;
          if (n.id === snapTargetId) return "#facc15";
          const isHovered = n.id === hoveredId;
          const dimmed = (isFiltering && !highlightIds!.has(n.id)) || (hoveredId != null && !isHovered);
          if (dimmed) return "#1e293b";
          if (isHovered) return "#ffffff";
          return n.color;
        }}
        nodeOpacity={0.92}
        linkColor={(link) => {
          if (!isFiltering) return "#334155";
          const s = typeof link.source === "object" ? (link.source as GraphNode).id : String(link.source ?? "");
          const t = typeof link.target === "object" ? (link.target as GraphNode).id : String(link.target ?? "");
          return highlightIds!.has(s) && highlightIds!.has(t) ? "#475569" : "#0f172a";
        }}
        linkWidth={1.8}
        linkOpacity={0.7}
        onNodeClick={(node) => onSelectNote?.((node as GraphNode).id, (node as GraphNode).label)}
        onNodeDrag={handleNodeDrag}
        onNodeDragEnd={handleNodeDragEnd}
        onLinkClick={handleLinkClick}
        onBackgroundClick={handleBackgroundClick}
        onNodeHover={(node) => onHover?.((node as GraphNode | null)?.id ?? null)}
        onEngineStop={handleEngineStop}
      />

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
          Computing semantic layout… (first run ~22 MB download)
        </div>
      )}
      {snapTargetId && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-xs px-3 py-1.5 rounded-full pointer-events-none font-medium">
          Release to snap / unsnap
        </div>
      )}
    </div>
  );
}
