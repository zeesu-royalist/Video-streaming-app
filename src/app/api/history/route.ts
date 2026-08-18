import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { watchHistory, videos, users } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = db
      .select({
        id: watchHistory.id,
        videoId: watchHistory.videoId,
        lastPosition: watchHistory.lastPosition,
        watchedAt: watchHistory.watchedAt,
        videoTitle: videos.title,
        videoFilePath: videos.filePath,
        videoCreatedAt: videos.createdAt,
        uploaderName: users.name,
      })
      .from(watchHistory)
      .innerJoin(videos, eq(watchHistory.videoId, videos.id))
      .leftJoin(users, eq(videos.uploaderId, users.id))
      .where(eq(watchHistory.userId, session.user.id))
      .orderBy(desc(watchHistory.watchedAt))
      .all();

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json({ error: "Failed to fetch watch history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, position } = body;

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const parsedPosition = Math.max(0, Math.floor(Number(position) || 0));

    // Check if entry already exists for user and video
    const existing = db
      .select()
      .from(watchHistory)
      .where(and(eq(watchHistory.userId, session.user.id), eq(watchHistory.videoId, videoId)))
      .get();

    if (existing) {
      const updated = db
        .update(watchHistory)
        .set({
          lastPosition: parsedPosition,
          watchedAt: sql`current_timestamp`,
        })
        .where(eq(watchHistory.id, existing.id))
        .returning()
        .get();

      return NextResponse.json(updated);
    } else {
      const inserted = db
        .insert(watchHistory)
        .values({
          userId: session.user.id,
          videoId,
          lastPosition: parsedPosition,
        })
        .returning()
        .get();

      return NextResponse.json(inserted, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/history error:", error);
    return NextResponse.json({ error: "Failed to update watch history" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    db.delete(watchHistory).where(eq(watchHistory.userId, session.user.id)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json({ error: "Failed to clear watch history" }, { status: 500 });
  }
}
