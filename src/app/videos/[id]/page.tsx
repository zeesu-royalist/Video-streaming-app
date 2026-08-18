import { db } from "@/db";
import { videos, users, watchlists, watchlistItems } from "@/db/schema";
import { eq, ne, desc, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
<<<<<<< HEAD
import VideoWatchClient from "@/components/VideoWatchClient";
=======
import WatchVideoClient from "@/components/WatchVideoClient";
>>>>>>> e5d9491 (Duration based comment, adding thumbnail system, progress bar for uploading, optimised for fast uploading, allow long video upload.)

export const dynamic = "force-dynamic";

export default async function WatchVideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ playlistId?: string }>;
}) {
  const { id } = await params;
  const { playlistId } = await searchParams;
  const session = await auth();

  const video = db
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
    .where(eq(videos.id, id))
    .get();

  if (!video) notFound();

  const recommendedVideos = db
    .select({
      id: videos.id,
      title: videos.title,
      filePath: videos.filePath,
      thumbnailPath: videos.thumbnailPath,
      duration: videos.duration,
      createdAt: videos.createdAt,
      uploaderName: users.name,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .where(ne(videos.id, id))
    .orderBy(desc(videos.createdAt))
    .all();

<<<<<<< HEAD
  let playlistContext: {
    id: string;
    name: string;
    items: { videoId: string; videoTitle: string }[];
  } | null = null;

  if (playlistId) {
    const list = db
      .select({ id: watchlists.id, name: watchlists.name })
      .from(watchlists)
      .where(eq(watchlists.id, playlistId))
      .get();

    if (list) {
      const items = db
        .select({
          videoId: videos.id,
          videoTitle: videos.title,
        })
        .from(watchlistItems)
        .innerJoin(videos, eq(watchlistItems.videoId, videos.id))
        .where(eq(watchlistItems.watchlistId, playlistId))
        .orderBy(asc(watchlistItems.orderIndex), desc(watchlistItems.addedAt))
        .all();

      playlistContext = {
        id: list.id,
        name: list.name,
        items,
      };
    }
  }

  return (
    <VideoWatchClient
      video={video}
      recommendedVideos={recommendedVideos}
      playlistContext={playlistContext}
      sessionUser={
        session?.user
          ? {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              role: (session.user as { role?: string }).role,
            }
          : null
      }
=======
  const canDelete =
    !!session?.user &&
    (session.user.id === video.uploaderId || session.user.role === "SUPER_ADMIN");

  return (
    <WatchVideoClient
      video={video}
      recommendedVideos={recommendedVideos}
      canDelete={canDelete}
      isLoggedIn={!!session?.user}
>>>>>>> e5d9491 (Duration based comment, adding thumbnail system, progress bar for uploading, optimised for fast uploading, allow long video upload.)
    />
  );
}
