import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteFromCloudinary } from "@/lib/upload";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id } = await params;

  const doc = db.select().from(documents).where(eq(documents.id, id)).get();
  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const isOwner = doc.uploaderId === session.user.id;
  const isAdmin = session.user.role === "SUPER_ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Permission denied." }, { status: 403 });
  }

  if (doc.publicId) {
    await deleteFromCloudinary(doc.publicId, doc.resourceType || "raw");
  }

  db.delete(documents).where(eq(documents.id, id)).run();

  return NextResponse.json({ success: true });
}
