import { GraphView } from "@/components/GraphView";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <GraphView />
    </main>
  );
}
