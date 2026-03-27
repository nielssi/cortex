import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [categories, notes, links] = await Promise.all([
    prisma.category.findMany(),
    prisma.note.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.link.findMany(),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    notes,
    links,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cortex-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
