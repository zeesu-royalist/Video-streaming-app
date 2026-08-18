import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  saveUploadedFile,
  getVideoThumbnailUrl,
  MAX_VIDEO_SIZE,
  ALLOWED_VIDEO_TYPES,
} from "@/lib/upload";

export const runtime = "nodejs";

// GET /api/videos -> list all videos (feed) with uploader name
export async function GET() {
  const rows = db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      filePath: videos.filePath,
      thumbnailPath: videos.thumbnailPath,
      duration: videos.duration,
      createdAt: videos.createdAt,
      uploaderId: videos.uploaderId,
      uploaderName: users.name,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .orderBy(desc(videos.createdAt))
    .all();

  return NextResponse.json({ videos: rows });
}

// POST /api/videos -> upload a new video or save direct Cloudinary metadata

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Super Admin can upload videos." },
      { status: 403 }
    );
  }

  // Verify that the logged-in user actually exists in the database
  const userExists = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, session.user.id))
    .get();

  if (!userExists) {
    return NextResponse.json(
      {
        error:
          "User session expired or account not found. Please log out and sign in again.",
      },
      { status: 401 }
    );
  }

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    const title = body.title?.trim();
    const description = body.description?.trim() || "";
    const url = body.url;
    const publicId = body.publicId;
    const resourceType = body.resourceType || "video";
    const duration = typeof body.duration === "number" ? Math.round(body.duration) : null;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and video file URL are required." },
        { status: 400 }
      );
    }

    const autoThumbnail = getVideoThumbnailUrl(url);

    const inserted = db
      .insert(videos)
      .values({
        title,
        description,
        filePath: url,
        publicId: publicId || null,
        resourceType,
        thumbnailPath: autoThumbnail,
        duration,
        uploaderId: session.user.id,
      })
      .returning()
      .get();

    return NextResponse.json({ video: inserted });
  }

  const formData = await req.formData();
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null) ?? "";
  const file = formData.get("file") as File | null;

  if (!title || !file) {
    return NextResponse.json(
      { error: "Both title and video file are required." },
      { status: 400 }
    );
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "This video format is not supported. Please use MP4, WebM, or Ogg." },
      { status: 400 }
    );
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      { error: "Video size cannot exceed 500MB." },
      { status: 400 }
    );
  }

  try {
    const uploadResult = await saveUploadedFile(file, "videos");
    const autoThumbnail = getVideoThumbnailUrl(uploadResult.url);

    const inserted = db
      .insert(videos)
      .values({
        title,
        description,
        filePath: uploadResult.url,
        publicId: uploadResult.publicId,
        resourceType: uploadResult.resourceType,
        thumbnailPath: autoThumbnail,
        duration: uploadResult.duration ?? null,
        uploaderId: session.user.id,
      })
      .returning()
      .get();

    return NextResponse.json({ video: inserted });
  } catch (err: unknown) {
    console.error("Video upload error:", err);
    const message = err instanceof Error ? err.message : "Failed to upload video.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

