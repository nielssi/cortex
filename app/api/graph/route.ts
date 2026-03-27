import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [notes, links] = await Promise.all([
    prisma.note.findMany({
      select: {
        id: true,
        title: true,
        category: { select: { color: true } },
        _count: { select: { linksFrom: true, linksTo: true } },
      },
    }),
    prisma.link.findMany({ select: { fromId: true, toId: true } }),
  ]);

  return NextResponse.json({
    nodes: notes.map((n) => ({
      id: n.id,
      label: n.title,
      color: n.category?.color ?? "#6366f1",
      connections: n._count.linksFrom + n._count.linksTo,
    })),
    links: links.map((l) => ({ source: l.fromId, target: l.toId })),
  });
}
