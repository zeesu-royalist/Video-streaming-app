import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { videos, documents } from "@/db/schema";
import { getUsersWithCounts } from "@/lib/admin-data";
import AdminUserTable from "@/components/AdminUserTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const rows = getUsersWithCounts();

  const totalVideos = db.select().from(videos).all().length;
  const totalDocuments = db.select().from(documents).all().length;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
      <h1 className="font-serif text-3xl md:text-4xl font-normal text-white mb-2">Admin Dashboard</h1>
      <p className="text-neutral-400 text-xs mb-8 font-medium">
        Manage platform user accounts, video uploads, and documents.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md p-6 shadow-md transition-all duration-300 hover:border-neutral-700/60 hover:bg-neutral-900/40">
          <p className="text-neutral-450 text-[10px] font-bold uppercase tracking-wider mb-2">Total Users</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md p-6 shadow-md transition-all duration-300 hover:border-neutral-700/60 hover:bg-neutral-900/40">
          <p className="text-neutral-450 text-[10px] font-bold uppercase tracking-wider mb-2">Total Videos</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{totalVideos}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md p-6 shadow-md transition-all duration-300 hover:border-neutral-700/60 hover:bg-neutral-900/40">
          <p className="text-neutral-450 text-[10px] font-bold uppercase tracking-wider mb-2">Total Documents</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{totalDocuments}</p>
        </div>
      </div>

      <AdminUserTable initialUsers={rows} currentUserId={session.user.id} />
    </div>
  );
}
