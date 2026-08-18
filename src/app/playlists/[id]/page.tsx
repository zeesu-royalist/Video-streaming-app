import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { watchlists, watchlistItems, videos, users } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { ListVideo, Play, Sparkles, User, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

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
    .where(eq(watchlists.id, id))
    .get();

  if (!list) {
    notFound();
  }

  // Access check: if private, must be creator or SUPER_ADMIN
  if (!list.isPublic && list.userId !== session?.user?.id && session?.user?.role !== "SUPER_ADMIN") {
    notFound();
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
    .where(eq(watchlistItems.watchlistId, id))
    .orderBy(asc(watchlistItems.orderIndex), desc(watchlistItems.addedAt))
    .all();

  const firstVideo = items[0];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8">
      
      {/* ── Playlist Header Card ── */}
      <div className="bg-[#181818] border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <ListVideo className="w-3.5 h-3.5" />
              <span>Playlist</span>
            </span>
            {list.isPublic ? (
              <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                🌐 Public
              </span>
            ) : (
              <span className="bg-neutral-800 text-neutral-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                🔒 Private
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {list.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span>Curated by <strong className="text-neutral-200">{list.creatorName || "Unknown"}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>{items.length} Videos</span>
            </span>
          </div>
        </div>

        {/* Play All CTA Button */}
        {firstVideo && (
          <Link
            href={`/videos/${firstVideo.videoId}?playlistId=${list.id}`}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black text-sm font-extrabold shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Watch All ({items.length} Videos)</span>
          </Link>
        )}
      </div>

      {/* ── Sequential Video Items List ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Sequential Video List</span>
        </h2>

        {items.length === 0 ? (
          <div className="p-12 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md text-center">
            <p className="text-neutral-400 text-sm font-semibold">
              This playlist is currently empty.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.itemId}
                className="group bg-[#181818] border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200 shadow-md"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="w-8 text-center text-sm font-extrabold text-neutral-500 group-hover:text-amber-500 transition-colors shrink-0">
                    {index + 1}
                  </span>

                  <Link
                    href={`/videos/${item.videoId}?playlistId=${list.id}`}
                    className="w-16 aspect-video rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-amber-500 group-hover:scale-105 transition-all shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/videos/${item.videoId}?playlistId=${list.id}`}
                      className="font-bold text-sm text-white truncate block group-hover:text-amber-400 transition-colors"
                    >
                      {item.videoTitle}
                    </Link>
                    <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                      {item.uploaderName || "Unknown"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/videos/${item.videoId}?playlistId=${list.id}`}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold border border-neutral-700/60 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current text-amber-500" />
                  <span>Watch Video</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
