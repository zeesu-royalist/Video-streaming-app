import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { watchlists, watchlistItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: watchlistId } = await params;
    const body = await req.json();
    const { videoId } = body;

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const list = db.select().from(watchlists).where(eq(watchlists.id, watchlistId)).get();
    if (!list) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    if (list.userId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if item already exists in this watchlist
    const existing = db
      .select()
      .from(watchlistItems)
      .where(
        and(
          eq(watchlistItems.watchlistId, watchlistId),
          eq(watchlistItems.videoId, videoId)
        )
      )
      .get();

    if (existing) {
      return NextResponse.json(existing);
    }

    const inserted = db
      .insert(watchlistItems)
      .values({
        watchlistId,
        videoId,
      })
      .returning()
      .get();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("POST /api/watchlists/[id]/items error:", error);
    return NextResponse.json({ error: "Failed to add video to watchlist" }, { status: 500 });
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

    const { id: watchlistId } = await params;
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "videoId query param is required" }, { status: 400 });
    }

    const list = db.select().from(watchlists).where(eq(watchlists.id, watchlistId)).get();
    if (!list) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    if (list.userId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    db.delete(watchlistItems)
      .where(
        and(
          eq(watchlistItems.watchlistId, watchlistId),
          eq(watchlistItems.videoId, videoId)
        )
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/watchlists/[id]/items error:", error);
    return NextResponse.json({ error: "Failed to remove video from watchlist" }, { status: 500 });
  }
}
