import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { embed } from "@/lib/embed";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), ".cortex-embeddings.json");

async function loadCache(): Promise<Record<string, number[]>> {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function saveCache(cache: Record<string, number[]>) {
  await writeFile(CACHE_PATH, JSON.stringify(cache));
}

export async function GET() {
  const notes = await prisma.note.findMany({
    select: { id: true, title: true, body: true, updatedAt: true },
  });

  const cache = await loadCache();
  let dirty = false;

  for (const note of notes) {
    const cacheKey = `${note.id}:${note.updatedAt.getTime()}`;
    // Check if we have a fresh embedding (keyed by id:updatedAt timestamp)
    const found = Object.keys(cache).find((k) => k === cacheKey);
    if (!found) {
      // Remove any stale entry for this note id
      for (const key of Object.keys(cache)) {
        if (key.startsWith(`${note.id}:`)) delete cache[key];
      }
      const text = `${note.title}. ${note.body.slice(0, 500)}`;
      cache[cacheKey] = await embed(text);
      dirty = true;
    }
  }

  if (dirty) await saveCache(cache);

  // Return as { [noteId]: number[] }
  const result: Record<string, number[]> = {};
  for (const [key, vec] of Object.entries(cache)) {
    const noteId = key.split(":")[0];
    result[noteId] = vec;
  }

  return NextResponse.json(result);
}
