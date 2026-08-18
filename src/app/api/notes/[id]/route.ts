import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: noteId } = await params;
    const existing = db.select().from(notes).where(eq(notes.id, noteId)).get();

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const isOwner = existing.userId === session.user.id;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: Partial<typeof notes.$inferInsert> = {};

    if (body.content !== undefined) {
      if (typeof body.content !== "string" || body.content.trim().length === 0) {
        return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
      }
      if (body.content.length > 1000) {
        return NextResponse.json({ error: "Note cannot exceed 1000 characters" }, { status: 400 });
      }
      updateData.content = body.content.trim();
    }

    if (body.isPublic !== undefined) {
      updateData.isPublic = Boolean(body.isPublic);
    }

    const updated = db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, noteId))
      .returning()
      .get();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: noteId } = await params;
    const existing = db.select().from(notes).where(eq(notes.id, noteId)).get();

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const isOwner = existing.userId === session.user.id;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    db.delete(notes).where(eq(notes.id, noteId)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
