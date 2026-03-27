import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

const NOTES_DIR = path.join(process.cwd(), "notes");

async function writeMarkdownFile(id: string, title: string, body: string, categoryName?: string) {
  await fs.mkdir(NOTES_DIR, { recursive: true });
  const frontmatter = [
    "---",
    `id: ${id}`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    categoryName ? `category: "${categoryName}"` : null,
    "---",
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");
  await fs.writeFile(path.join(NOTES_DIR, `${id}.md`), frontmatter + body, "utf-8");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      category: true,
      linksFrom: { include: { to: { select: { id: true, title: true } } } },
      linksTo:   { include: { from: { select: { id: true, title: true } } } },
    },
  });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, body, categoryId } = await req.json();
  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(body !== undefined && { body }),
      ...(categoryId !== undefined && { categoryId: categoryId ?? null }),
    },
    include: { category: true },
  });
  await writeMarkdownFile(note.id, note.title, note.body, note.category?.name);

  // Sync wikilinks [[title]] → Link records (additive only, never removes manual links)
  if (body !== undefined) {
    const wikilinkTitles = [...(body as string).matchAll(/\[\[([^\]]+)\]\]/g)]
      .map((m) => m[1].split("#")[0].trim())
      .filter(Boolean);
    if (wikilinkTitles.length > 0) {
      const targets = await prisma.note.findMany({
        where: { title: { in: wikilinkTitles }, id: { not: id } },
        select: { id: true },
      });
      for (const target of targets) {
        await prisma.link.upsert({
          where: { fromId_toId: { fromId: id, toId: target.id } },
          update: {},
          create: { fromId: id, toId: target.id },
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json(note);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.note.delete({ where: { id } });
  try {
    await fs.unlink(path.join(NOTES_DIR, `${id}.md`));
  } catch {
    // file may not exist yet, ignore
  }
  return NextResponse.json({ ok: true });
}
