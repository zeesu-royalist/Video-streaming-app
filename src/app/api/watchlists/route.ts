import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { watchlists, watchlistItems, videos, users } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPublicQuery = searchParams.get("public") === "true";

    if (isPublicQuery) {
      // Fetch all public watchlists created by Super Admins
      const publicWatchlists = db
        .select({
          id: watchlists.id,
          userId: watchlists.userId,
          name: watchlists.name,
          isPublic: watchlists.isPublic,
          createdAt: watchlists.createdAt,
          creatorName: users.name,
        })
        .from(watchlists)
        .innerJoin(users, eq(watchlists.userId, users.id))
        .where(eq(watchlists.isPublic, true))
        .orderBy(desc(watchlists.createdAt))
        .all();

      const results = publicWatchlists.map((list: { id: string; userId: string; name: string; isPublic: boolean; createdAt: string; creatorName: string | null }) => {
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
          .where(eq(watchlistItems.watchlistId, list.id))
          .orderBy(asc(watchlistItems.orderIndex), desc(watchlistItems.addedAt))
          .all();

        return {
          ...list,
          items,
        };
      });

      return NextResponse.json(results);
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWatchlists = db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, session.user.id))
      .orderBy(desc(watchlists.createdAt))
      .all();

    const results = userWatchlists.map((list: typeof watchlists.$inferSelect) => {
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
        .where(eq(watchlistItems.watchlistId, list.id))
        .orderBy(asc(watchlistItems.orderIndex), desc(watchlistItems.addedAt))
        .all();

      return {
        ...list,
        items,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/watchlists error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlists" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Watchlist name is required" }, { status: 400 });
    }

    const inserted = db
      .insert(watchlists)
      .values({
        userId: session.user.id,
        name: name.trim(),
      })
      .returning()
      .get();

    return NextResponse.json({ ...inserted, items: [] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/watchlists error:", error);
    return NextResponse.json({ error: "Failed to create watchlist" }, { status: 500 });
  }
}
