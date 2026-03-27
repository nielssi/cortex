import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
    where: { parentId: null },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name, color, parentId } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: { name: name.trim(), color: color ?? "#6366f1", parentId: parentId ?? null },
  });
  return NextResponse.json(category, { status: 201 });
}
