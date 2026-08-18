import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteFromCloudinary } from "@/lib/upload";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const row = db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      filePath: videos.filePath,
      duration: videos.duration,
      createdAt: videos.createdAt,
      uploaderId: videos.uploaderId,
      uploaderName: users.name,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .where(eq(videos.id, id))
    .get();

  if (!row) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  return NextResponse.json({ video: row });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { duration } = await req.json();

  if (typeof duration === "number" && duration > 0) {
    const rounded = Math.round(duration);
    db.update(videos)
      .set({ duration: rounded })
      .where(eq(videos.id, id))
      .run();
    return NextResponse.json({ success: true, duration: rounded });
  }

  return NextResponse.json({ error: "Invalid duration." }, { status: 400 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id } = await params;

  const video = db.select().from(videos).where(eq(videos.id, id)).get();
  if (!video) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  const isAdmin = session.user.role === "SUPER_ADMIN";

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Only Super Admin can delete videos." },
      { status: 403 }
    );
  }

  if (video.publicId) {
    await deleteFromCloudinary(video.publicId, video.resourceType || "video");
  }

  db.delete(videos).where(eq(videos.id, id)).run();

  return NextResponse.json({ success: true });
}
