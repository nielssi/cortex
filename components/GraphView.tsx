"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph").then((m) => m.ForceGraph2D), {
  ssr: false,
});

type Node = { id: string; label: string };
type Link = { source: string; target: string };
type GraphData = { nodes: Node[]; links: Link[] };

export function GraphView() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then(setGraphData);
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

  return (
    <div ref={containerRef} className="flex-1 w-full h-full bg-slate-900 relative">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="label"
        nodeColor={() => "#6366f1"}
        nodeRelSize={6}
        linkColor={() => "#475569"}
        linkWidth={1.5}
        backgroundColor="#0f172a"
        onNodeClick={(node) => router.push(`/note/${(node as Node).id}`)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as Node & { x: number; y: number };
          const label = n.label;
          const fontSize = Math.max(10 / globalScale, 3);
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = "#6366f1";
          ctx.beginPath();
          ctx.arc(n.x, n.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = "#e2e8f0";
          ctx.textAlign = "center";
          ctx.fillText(label, n.x, n.y + 10);
        }}
      />
      {graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-400 text-sm">No notes yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
