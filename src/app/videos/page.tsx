import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/db";
import { videos, users, documents } from "@/db/schema";
import { desc, eq, or, and, like } from "drizzle-orm";
<<<<<<< HEAD
import CuratedPlaylistsSection from "@/components/CuratedPlaylistsSection";
import { getDocumentUrl } from "@/lib/upload";
=======
import { getDocumentUrl, getVideoThumbnailUrl } from "@/lib/upload";
import { formatTimestamp } from "@/lib/format";
>>>>>>> e5d9491 (Duration based comment, adding thumbnail system, progress bar for uploading, optimised for fast uploading, allow long video upload.)

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  pdf: "📕",
  doc: "📘",
  docx: "📘",
  ppt: "📙",
  pptx: "📙",
  txt: "📄",
  png: "🖼️",
  jpg: "🖼️",
  jpeg: "🖼️",
};

function getIcon(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return ICONS[ext] ?? "📄";
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const whereConditions = q
    ? or(like(videos.title, `%${q}%`), like(videos.description, `%${q}%`))
    : undefined;

  const rows = db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      filePath: videos.filePath,
      thumbnailPath: videos.thumbnailPath,
      duration: videos.duration,
      createdAt: videos.createdAt,
      uploaderName: users.name,
    })
    .from(videos)
    .leftJoin(users, eq(videos.uploaderId, users.id))
    .where(whereConditions)
    .orderBy(desc(videos.createdAt))
    .all();

  let matchingDocs: {
    id: string;
    title: string;
    filePath: string;
    visibility: "PUBLIC" | "PRIVATE";
    createdAt: string;
    uploaderId: string;
    uploaderName: string | null;
  }[] = [];

  if (q) {
    const visibilityCondition = session?.user
      ? or(
          eq(documents.visibility, "PUBLIC"),
          eq(documents.uploaderId, session.user.id)
        )
      : eq(documents.visibility, "PUBLIC");

    matchingDocs = db
      .select({
        id: documents.id,
        title: documents.title,
        filePath: documents.filePath,
        visibility: documents.visibility,
        createdAt: documents.createdAt,
        uploaderId: documents.uploaderId,
        uploaderName: users.name,
      })
      .from(documents)
      .leftJoin(users, eq(documents.uploaderId, users.id))
      .where(and(visibilityCondition, like(documents.title, `%${q}%`)))
      .orderBy(desc(documents.createdAt))
      .all();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
      {/* ── Admin Curated Public Playlists ── */}
      {!q && <CuratedPlaylistsSection />}

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">All Videos</h1>
          <p className="text-xs text-neutral-400 font-medium mt-1">Stream exclusive video content and student projects</p>
        </div>
        {isSuperAdmin && (
          <Link
            href="/upload/video"
            className="px-5 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b8070f] text-white text-xs font-bold transition shadow-[0_4px_14px_rgba(229,9,20,0.25)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Upload Video</span>
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="p-12 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md text-center">
          <p className="text-neutral-400 text-sm font-semibold font-sans">
            {q ? `No videos found matching "${q}".` : "No videos uploaded yet."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((v) => {
            const thumbUrl = v.thumbnailPath || (v.filePath ? getVideoThumbnailUrl(v.filePath) : "");
            return (
              <Link
                key={v.id}
                href={`/videos/${v.id}`}
                className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/25 hover:border-neutral-700/60 hover:bg-neutral-900/40 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 flex flex-col"
              >
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
                  {v.duration !== undefined && v.duration !== null && (
                    <span className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-mono font-medium px-1.5 py-0.5 rounded shadow">
                      {formatTimestamp(v.duration)}
                    </span>
                  )}
                </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-sm text-neutral-100 line-clamp-1 group-hover:text-[#E50914] transition-colors duration-200">
                  {v.title}
                </h3>
                <p className="text-[11px] text-neutral-500 font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <span>{v.uploaderName || "Anonymous"}</span>
                  <span>•</span>
                  <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
            </Link>
            );
          })}
        </div>
      )}
      {q && matchingDocs.length > 0 && (
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-normal text-white">Matching Documents</h2>
            <p className="text-xs text-neutral-400 font-medium mt-1">Documents matching your search query</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {matchingDocs.map((d) => (
              <div
                key={d.id}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 hover:border-neutral-700/60 hover:bg-neutral-900/40 backdrop-blur-md px-6 py-4.5 transition-all duration-300 shadow-md"
              >
                <a
                  href={getDocumentUrl(d.filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <span className="text-3xl shrink-0 group-hover:scale-105 transition-transform duration-200">{getIcon(d.filePath)}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-neutral-100 truncate group-hover:text-[#E50914] transition-colors duration-200">
                      {d.title}
                    </p>
                    <p className="text-[11px] font-bold text-neutral-500 mt-1 uppercase tracking-wide flex flex-wrap items-center gap-2">
                      <span>{d.uploaderName || "Anonymous"}</span>
                      <span>•</span>
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{d.visibility === "PUBLIC" ? "🌐 Public" : "🔒 Private"}</span>
                    </p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
