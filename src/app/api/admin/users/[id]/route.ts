import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, videos, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteFromCloudinary } from "@/lib/upload";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

// PATCH -> toggle block/unblock or change role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot modify yourself." },
      { status: 400 }
    );
  }

  const updates: Partial<{ isBlocked: boolean; role: "SUPER_ADMIN" | "STUDENT" }> = {};

  if (typeof body.isBlocked === "boolean") {
    updates.isBlocked = body.isBlocked;
  }
  if (body.role === "SUPER_ADMIN" || body.role === "STUDENT") {
    updates.role = body.role;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  db.update(users).set(updates).where(eq(users.id, id)).run();

  return NextResponse.json({ success: true });
}

// DELETE -> remove user (and their videos/documents/comments via cascade)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot delete yourself." },
      { status: 400 }
    );
  }

  const userVideos = db.select().from(videos).where(eq(videos.uploaderId, id)).all();
  for (const v of userVideos) {
    if (v.publicId) {
      await deleteFromCloudinary(v.publicId, v.resourceType || "video");
    }
  }

  const userDocs = db.select().from(documents).where(eq(documents.uploaderId, id)).all();
  for (const d of userDocs) {
    if (d.publicId) {
      await deleteFromCloudinary(d.publicId, d.resourceType || "raw");
    }
  }

  db.delete(users).where(eq(users.id, id)).run();

  return NextResponse.json({ success: true });
}
