import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: fromId } = await params;
  const { toId } = await req.json();
  if (!toId || fromId === toId) {
    return NextResponse.json({ error: "Invalid link target" }, { status: 400 });
  }
  const link = await prisma.link.upsert({
    where: { fromId_toId: { fromId, toId } },
    create: { fromId, toId },
    update: {},
  });
  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: fromId } = await params;
  const { toId } = await req.json();
  await prisma.link.deleteMany({ where: { fromId, toId } });
  return NextResponse.json({ ok: true });
}
