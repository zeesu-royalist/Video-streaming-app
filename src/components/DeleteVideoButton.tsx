"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteVideoButton({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this video?")) return;
    setLoading(true);
    const res = await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push("/videos");
      router.refresh();
    } else {
      alert("Failed to delete the video.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm px-3 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-950 transition shrink-0"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
