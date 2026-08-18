"use client";

import { useState, useEffect } from "react";
import { Bookmark, Plus, X } from "lucide-react";

export interface WatchlistData {
  id: string;
  name: string;
  items: { videoId: string }[];
}

interface SaveToWatchlistModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveToWatchlistModal({
  videoId,
  isOpen,
  onClose,
}: SaveToWatchlistModalProps) {
  const [watchlists, setWatchlists] = useState<WatchlistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const refreshWatchlists = async () => {
    try {
      const res = await fetch("/api/watchlists");
      if (res.ok) {
        const data = await res.json();
        setWatchlists(data);
      }
    } catch (err) {
      console.error("Failed to refresh watchlists:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    async function loadWatchlists() {
      try {
        setLoading(true);
        const res = await fetch("/api/watchlists");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setWatchlists(data);
        }
      } catch (err) {
        console.error("Failed to load watchlists:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadWatchlists();
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const handleToggleItem = async (list: WatchlistData) => {
    const isMember = list.items.some((item) => item.videoId === videoId);
    try {
      if (isMember) {
        // Remove item
        const res = await fetch(`/api/watchlists/${list.id}/items?videoId=${videoId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setWatchlists((prev) =>
            prev.map((w) =>
              w.id === list.id
                ? { ...w, items: w.items.filter((i) => i.videoId !== videoId) }
                : w
            )
          );
        }
      } else {
        // Add item
        const res = await fetch(`/api/watchlists/${list.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        if (res.ok) {
          setWatchlists((prev) =>
            prev.map((w) =>
              w.id === list.id
                ? { ...w, items: [...w.items, { videoId }] }
                : w
            )
          );
        }
      }
    } catch (err) {
      console.error("Failed to update watchlist membership:", err);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      setCreating(true);
      setError("");
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      });

      if (res.ok) {
        const newList = await res.json();
        // Immediately add video to new list
        await fetch(`/api/watchlists/${newList.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });

        setNewListName("");
        refreshWatchlists();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create watchlist.");
      }
    } catch {
      setError("Failed to create watchlist.");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <span>Save to Watchlist</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watchlist Checkbox Options */}
        {loading ? (
          <p className="text-xs text-neutral-400 py-4 text-center">Loading your watchlists...</p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {watchlists.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3 text-center">No custom watchlists created yet.</p>
            ) : (
              watchlists.map((list) => {
                const isChecked = list.items.some((item) => item.videoId === videoId);
                return (
                  <label
                    key={list.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-900 cursor-pointer text-sm font-medium transition-colors select-none"
                  >
                    <span className="truncate pr-2">{list.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleItem(list)}
                      className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                  </label>
                );
              })
            )}
          </div>
        )}

        {/* Create New List Form */}
        <form onSubmit={handleCreateList} className="border-t border-neutral-800 pt-3 space-y-2">
          <p className="text-xs font-semibold text-neutral-400">Create new watchlist</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="List name (e.g. Coding Tutorials)"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1 bg-[#0f0f0f] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={creating || !newListName.trim()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>

        <div className="pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
