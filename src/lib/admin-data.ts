import { db } from "@/db";
import { users, videos, documents } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export function getUsersWithCounts() {
  const allUsers = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isBlocked: users.isBlocked,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .all();

  const videoCounts = (db
    .select({
      uploaderId: videos.uploaderId,
      count: sql<number>`count(*)`,
    })
    .from(videos)
    .groupBy(videos.uploaderId)
    .all()) as Array<{ uploaderId: string; count: number }>;

  const documentCounts = (db
    .select({
      uploaderId: documents.uploaderId,
      count: sql<number>`count(*)`,
    })
    .from(documents)
    .groupBy(documents.uploaderId)
    .all()) as Array<{ uploaderId: string; count: number }>;

  const videoCountMap = new Map(videoCounts.map((v) => [v.uploaderId, v.count]));
  const documentCountMap = new Map(
    documentCounts.map((d) => [d.uploaderId, d.count])
  );

  return (allUsers as Array<typeof users.$inferSelect>).map((u) => ({
    ...u,
    videoCount: videoCountMap.get(u.id) ?? 0,
    documentCount: documentCountMap.get(u.id) ?? 0,
  }));
}
