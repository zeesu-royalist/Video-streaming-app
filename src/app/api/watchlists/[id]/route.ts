import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { watchlists, watchlistItems, videos, users } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: watchlistId } = await params;

    const list = db
      .select({
        id: watchlists.id,
        userId: watchlists.userId,
        name: watchlists.name,
        isPublic: watchlists.isPublic,
        createdAt: watchlists.createdAt,
        creatorName: users.name,
      })
      .from(watchlists)
      .leftJoin(users, eq(watchlists.userId, users.id))
      .where(eq(watchlists.id, watchlistId))
      .get();

    if (!list) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    // Access check: if private, must be creator or SUPER_ADMIN
    if (!list.isPublic && list.userId !== session?.user?.id && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Private playlist" }, { status: 403 });
    }

    const items = db
      .select({
        itemId: watchlistItems.id,
        orderIndex: watchlistItems.orderIndex,
        addedAt: watchlistItems.addedAt,
        videoId: videos.id,
        videoTitle: videos.title,
        videoFilePath: videos.filePath,
        videoCreatedAt: videos.createdAt,
        uploaderName: users.name,
      })
      .from(watchlistItems)
      .innerJoin(videos, eq(watchlistItems.videoId, videos.id))
      .leftJoin(users, eq(videos.uploaderId, users.id))
      .where(eq(watchlistItems.watchlistId, watchlistId))
      .orderBy(asc(watchlistItems.orderIndex), desc(watchlistItems.addedAt))
      .all();

    return NextResponse.json({
      ...list,
      items,
    });
  } catch (error) {
    console.error("GET /api/watchlists/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: watchlistId } = await params;
    const existing = db.select().from(watchlists).where(eq(watchlists.id, watchlistId)).get();

    if (!existing) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    if (existing.userId !== session.user.id && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, isPublic } = body;

    const updates: Partial<{ name: string; isPublic: boolean }> = {};
    if (typeof name === "string" && name.trim().length > 0) {
      updates.name = name.trim();
    }

    // Only SUPER_ADMIN can toggle isPublic!
    if (typeof isPublic === "boolean") {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Only Super Admin can toggle public status." },
          { status: 403 }
        );
      }
      updates.isPublic = isPublic;
    }

    const updated = db
      .update(watchlists)
      .set(updates)
      .where(eq(watchlists.id, watchlistId))
      .returning()
      .get();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/watchlists/[id] error:", error);
    return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: watchlistId } = await params;
    const existing = db.select().from(watchlists).where(eq(watchlists.id, watchlistId)).get();

    if (!existing) {
      return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    db.delete(watchlists).where(eq(watchlists.id, watchlistId)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/watchlists/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete watchlist" }, { status: 500 });
  }
}
