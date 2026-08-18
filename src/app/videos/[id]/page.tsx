import { db } from "@/db";
import { videos, users, watchlists, watchlistItems } from "@/db/schema";
import { eq, ne, desc, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import WatchVideoClient from "@/components/WatchVideoClient";

export const dynamic = "force-dynamic";

export default async function WatchVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ playlistId?: string }>;
}) {
  const { id } = await params;
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

  const canDelete =
    !!session?.user &&
    (session.user.id === video.uploaderId || session.user.role === "SUPER_ADMIN");

  return (
    <WatchVideoClient
      video={video}
      recommendedVideos={recommendedVideos}
      canDelete={canDelete}
      isLoggedIn={!!session?.user}
    />
  );
}
