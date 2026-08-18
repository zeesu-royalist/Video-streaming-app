"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "STUDENT";
  isBlocked: boolean;
  createdAt: string;
  videoCount: number;
  documentCount: number;
};

export default function AdminUserTable({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleBlock(user: AdminUser) {
    setBusyId(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !user.isBlocked }),
    });
    setBusyId(null);
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u
        )
      );
    } else {
      alert("Update failed.");
    }
  }

  async function changeRole(user: AdminUser, role: "SUPER_ADMIN" | "STUDENT") {
    setBusyId(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusyId(null);
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role } : u))
      );
    } else {
      alert("Update failed.");
    }
  }

  async function deleteUser(user: AdminUser) {
    if (
      !confirm(
        `Are you sure you want to delete "${user.name}"? Their videos and documents will also be deleted.`
      )
    )
      return;
    setBusyId(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });
    setBusyId(null);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Delete failed.");
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300">
      <table className="w-full text-sm">
        <thead className="bg-neutral-950/40 text-neutral-400 text-left border-b border-neutral-800/60">
          <tr>
            <th className="px-6 py-4.5 font-bold uppercase tracking-wider text-[10px]">Name</th>
            <th className="px-6 py-4.5 font-bold uppercase tracking-wider text-[10px]">Email</th>
            <th className="px-6 py-4.5 font-bold uppercase tracking-wider text-[10px]">Role</th>
            <th className="px-6 py-4.5 font-bold uppercase tracking-wider text-[10px]">Content</th>
            <th className="px-6 py-4.5 font-bold uppercase tracking-wider text-[10px]">Status</th>
            <th className="px-6 py-4.5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900">
          {users.map((u) => (
            <tr
              key={u.id}
              className="hover:bg-neutral-900/20 transition-colors duration-150"
            >
              <td className="px-6 py-4 font-semibold text-neutral-200">
                {u.name}
                {u.id === currentUserId && (
                  <span className="text-[10px] font-bold text-[#E50914] bg-[#E50914]/10 border border-[#E50914]/20 px-1.5 py-0.5 rounded-md ml-2 uppercase tracking-wider">(You)</span>
                )}
              </td>
              <td className="px-6 py-4 text-neutral-450 font-medium">{u.email}</td>
              <td className="px-6 py-4">
                {u.id === currentUserId ? (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-1 rounded-full">{u.role}</span>
                ) : (
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) =>
                      changeRole(
                        u,
                        e.target.value as "SUPER_ADMIN" | "STUDENT"
                      )
                    }
                    className="bg-neutral-950/40 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] cursor-pointer"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                )}
              </td>
              <td className="px-6 py-4 text-neutral-450 font-semibold text-xs">
                {u.videoCount} videos · {u.documentCount} docs
              </td>
              <td className="px-6 py-4">
                {u.isBlocked ? (
                  <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-950/30 border border-red-500/20">
                    Blocked
                  </span>
                ) : (
                  <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/20">
                    Active
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {u.id !== currentUserId && (
                  <div className="flex justify-end gap-2.5">
                    <button
                      onClick={() => toggleBlock(u)}
                      disabled={busyId === u.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-all cursor-pointer"
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      onClick={() => deleteUser(u)}
                      disabled={busyId === u.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-950/60 hover:border-red-900 hover:bg-red-950/30 text-red-400 transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
