import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [notes, links] = await Promise.all([
    prisma.note.findMany({ select: { id: true, title: true } }),
    prisma.link.findMany({ select: { fromId: true, toId: true } }),
  ]);
  return NextResponse.json({
    nodes: notes.map((n) => ({ id: n.id, label: n.title })),
    links: links.map((l) => ({ source: l.fromId, target: l.toId })),
  });
}
