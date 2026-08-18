"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteDocumentButton({
  documentId,
}: {
  documentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setLoading(true);
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete the document.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm px-3 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-950 transition shrink-0"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
