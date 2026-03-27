import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

const NOTES_DIR = path.join(process.cwd(), "notes");

function parseFrontmatter(content: string): { title: string | null; body: string } {
  if (!content.startsWith("---")) return { title: null, body: content };
  const end = content.indexOf("\n---", 3);
  if (end === -1) return { title: null, body: content };
  const fm = content.slice(3, end);
  const body = content.slice(end + 4).replace(/^\n/, "");
  const titleMatch = fm.match(/^title:\s*"?(.+?)"?\s*$/m);
  return { title: titleMatch?.[1] ?? null, body };
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // First pass: create all notes so wikilinks can be resolved
  const created: { id: string; title: string; body: string }[] = [];

  for (const file of files) {
    const raw = await file.text();
    const { title: fmTitle, body } = parseFrontmatter(raw);
    const title = fmTitle ?? file.name.replace(/\.md$/i, "").trim() || "Untitled";

    // Skip if a note with this title already exists
    const existing = await prisma.note.findFirst({ where: { title } });
    if (existing) {
      created.push({ id: existing.id, title: existing.title, body: existing.body });
      continue;
    }

    const note = await prisma.note.create({ data: { title, body } });
    await fs.mkdir(NOTES_DIR, { recursive: true });
    await fs.writeFile(path.join(NOTES_DIR, `${note.id}.md`), raw, "utf-8");
    created.push({ id: note.id, title: note.title, body });
  }

  // Second pass: resolve [[wikilinks]] and create Link records
  const titleToId = Object.fromEntries(created.map((n) => [n.title, n.id]));
  let links = 0;

  for (const note of created) {
    const matches = [...note.body.matchAll(/\[\[([^\]]+)\]\]/g)];
    for (const m of matches) {
      const targetTitle = m[1].split("#")[0].trim();
      const toId = titleToId[targetTitle];
      if (!toId || toId === note.id) continue;
      await prisma.link.upsert({
        where: { fromId_toId: { fromId: note.id, toId } },
        update: {},
        create: { fromId: note.id, toId },
      }).catch(() => {});
      links++;
    }
  }

  return NextResponse.json({ ok: true, imported: created.length, links });
}
