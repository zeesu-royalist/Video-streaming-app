import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { videos, documents } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import DeleteVideoButton from "@/components/DeleteVideoButton";
import DeleteDocumentButton from "@/components/DeleteDocumentButton";
import { getDocumentUrl, getVideoThumbnailUrl } from "@/lib/upload";
import MyListSection from "@/components/MyListSection";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const myVideos = (
    isSuperAdmin
      ? db
          .select()
          .from(videos)
          .where(eq(videos.uploaderId, session.user.id))
          .orderBy(desc(videos.createdAt))
          .all()
      : []
  ) as (typeof videos.$inferSelect)[];

  const myDocuments = (db
    .select()
    .from(documents)
    .where(eq(documents.uploaderId, session.user.id))
    .orderBy(desc(documents.createdAt))
    .all()) as (typeof documents.$inferSelect)[];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col gap-12">
      <div>
        <h1 className="font-serif text-3xl font-normal text-white">
          Welcome, {session.user.name} 👋
        </h1>
        <p className="text-neutral-400 text-xs mt-1 font-medium">
          Manage your watch history, custom watchlists, and document files from your dashboard.
        </p>
      </div>

      {/* ── My List: Watch History & Custom Watchlists ── */}
      <section>
        <MyListSection isSuperAdmin={isSuperAdmin} />
      </section>

      {/* ── Super Admin Uploaded Videos Section (Super Admin only) ── */}
      {isSuperAdmin && (
        <section>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-900">
            <h2 className="font-serif text-lg font-normal text-white">My Uploaded Videos</h2>
            <Link
              href="/upload/video"
              className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#b8070f] text-white text-xs font-bold transition shadow-[0_4px_14px_rgba(229,9,20,0.25)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Upload Video</span>
            </Link>
          </div>

          {myVideos.length === 0 ? (
            <div className="p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md text-center">
              <p className="text-neutral-500 text-xs font-semibold">You haven&apos;t uploaded any videos yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myVideos.map((v) => {
                const thumbUrl = v.thumbnailPath || (v.filePath ? getVideoThumbnailUrl(v.filePath) : "");
                return (
                  <div
                    key={v.id}
                    className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/25 hover:border-neutral-700/60 hover:bg-neutral-900/40 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 flex flex-col"
                  >
                    <Link href={`/videos/${v.id}`}>
                      <div className="aspect-video bg-neutral-950/60 border-b border-neutral-900/80 flex items-center justify-center text-neutral-600 text-3xl relative overflow-hidden shrink-0">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={v.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="group-hover:scale-110 group-hover:text-[#E50914] transition-all duration-300">▶</span>
                        )}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <div className="w-10 h-10 rounded-full bg-[#E50914]/90 text-white flex items-center justify-center pl-0.5 shadow-md">
                            ▶
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 flex items-center justify-between gap-3 flex-1">
                      <Link
                        href={`/videos/${v.id}`}
                        className="font-bold text-xs text-neutral-100 truncate hover:text-[#E50914] transition-colors duration-200"
                      >
                        {v.title}
                      </Link>
                      <div className="shrink-0">
                        <DeleteVideoButton videoId={v.id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-900">
          <h2 className="font-serif text-lg font-normal text-white">My Documents</h2>
          <Link
            href="/upload/document"
            className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#b8070f] text-white text-xs font-bold transition shadow-[0_4px_14px_rgba(229,9,20,0.25)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Upload Document</span>
          </Link>
        </div>

        {myDocuments.length === 0 ? (
          <div className="p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md text-center">
            <p className="text-neutral-500 text-xs font-semibold">You haven&apos;t uploaded any documents yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {myDocuments.map((d) => (
              <div
                key={d.id}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 hover:border-neutral-700/60 hover:bg-neutral-900/40 backdrop-blur-md px-6 py-4 transition-all duration-300 shadow-md"
              >
                <a
                  href={getDocumentUrl(d.filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0"
                >
                  <p className="font-bold text-xs text-neutral-100 truncate group-hover:text-[#E50914] transition-colors duration-200">
                    {d.title}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-500 mt-1 uppercase tracking-wide flex items-center gap-2">
                    <span>{d.visibility === "PUBLIC" ? "🌐 Public" : "🔒 Private"}</span>
                    <span>•</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </p>
                </a>
                <div className="shrink-0">
                  <DeleteDocumentButton documentId={d.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
