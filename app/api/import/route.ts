import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

const NOTES_DIR = path.join(process.cwd(), "notes");

export async function POST(req: Request) {
  let payload: {
    version: number;
    categories: { id: string; name: string; color: string; parentId: string | null }[];
    notes: { id: string; title: string; body: string; categoryId: string | null; createdAt: string; updatedAt: string }[];
    links: { id: string; fromId: string; toId: string }[];
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.version !== 1) {
    return NextResponse.json({ error: "Unsupported export version" }, { status: 400 });
  }

  // Import categories (parents before children — sort by parentId null first)
  const sorted = [...payload.categories].sort((a, b) =>
    a.parentId === null ? -1 : b.parentId === null ? 1 : 0
  );
  for (const c of sorted) {
    await prisma.category.upsert({
      where: { id: c.id },
      create: { id: c.id, name: c.name, color: c.color, parentId: c.parentId },
      update: { name: c.name, color: c.color, parentId: c.parentId },
    });
  }

  // Import notes
  await fs.mkdir(NOTES_DIR, { recursive: true });
  for (const n of payload.notes) {
    await prisma.note.upsert({
      where: { id: n.id },
      create: { id: n.id, title: n.title, body: n.body, categoryId: n.categoryId, createdAt: new Date(n.createdAt), updatedAt: new Date(n.updatedAt) },
      update: { title: n.title, body: n.body, categoryId: n.categoryId },
    });
    const cat = payload.categories.find((c) => c.id === n.categoryId);
    const frontmatter = `---\nid: ${n.id}\ntitle: "${n.title.replace(/"/g, '\\"')}"\n${cat ? `category: "${cat.name}"\n` : ""}---\n\n`;
    await fs.writeFile(path.join(NOTES_DIR, `${n.id}.md`), frontmatter + n.body, "utf-8");
  }

  // Import links
  for (const l of payload.links) {
    await prisma.link.upsert({
      where: { fromId_toId: { fromId: l.fromId, toId: l.toId } },
      create: { fromId: l.fromId, toId: l.toId },
      update: {},
    });
  }

  return NextResponse.json({
    ok: true,
    imported: { categories: payload.categories.length, notes: payload.notes.length, links: payload.links.length },
  });
}
