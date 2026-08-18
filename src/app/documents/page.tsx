import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents, users } from "@/db/schema";
import { desc, eq, or, and, like } from "drizzle-orm";
import DeleteDocumentButton from "@/components/DeleteDocumentButton";
import { getDocumentUrl } from "@/lib/upload";

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

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();

  const visibilityCondition = session?.user
    ? or(
        eq(documents.visibility, "PUBLIC"),
        eq(documents.uploaderId, session.user.id)
      )
    : eq(documents.visibility, "PUBLIC");

  const searchCondition = q ? like(documents.title, `%${q}%`) : undefined;

  const whereCondition = searchCondition
    ? and(visibilityCondition, searchCondition)
    : visibilityCondition;

  const rows = db
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
    .where(whereCondition)
    .orderBy(desc(documents.createdAt))
    .all();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-white">Documents</h1>
          <p className="text-xs text-neutral-400 font-medium mt-1">Access lecture notes, slides, and shared documents</p>
        </div>
        {session?.user && (
          <Link
            href="/upload/document"
            className="px-5 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b8070f] text-white text-xs font-bold transition shadow-[0_4px_14px_rgba(229,9,20,0.25)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Upload Document</span>
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="p-12 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md text-center">
          <p className="text-neutral-400 text-sm font-semibold">
            {q ? `No documents found matching "${q}".` : "No documents available yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((d) => {
            const canDelete =
              session?.user &&
              (session.user.id === d.uploaderId ||
                session.user.role === "SUPER_ADMIN");
            return (
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
                {canDelete && (
                  <div className="shrink-0">
                    <DeleteDocumentButton documentId={d.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
