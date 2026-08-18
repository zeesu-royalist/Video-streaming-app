"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Bookmark, Play, Trash2, Plus, X, ListVideo } from "lucide-react";

export interface HistoryItem {
  id: string;
  videoId: string;
  lastPosition: number;
  watchedAt: string;
  videoTitle: string;
  videoFilePath: string;
  videoCreatedAt: string;
  uploaderName?: string | null;
}

export interface Watchlist {
  id: string;
  name: string;
  isPublic?: boolean;
  createdAt: string;
  items: {
    itemId: string;
    orderIndex: number;
    addedAt: string;
    videoId: string;
    videoTitle: string;
    videoFilePath: string;
    videoCreatedAt: string;
    uploaderName?: string | null;
  }[];
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
}

interface MyListSectionProps {
  isSuperAdmin?: boolean;
}

export default function MyListSection({ isSuperAdmin = false }: MyListSectionProps) {
  const [activeTab, setActiveTab] = useState<"history" | "watchlists">("history");
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Watchlists State
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loadingWatchlists, setLoadingWatchlists] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [error, setError] = useState("");

  const refreshHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch watch history:", err);
    }
  };

  const refreshWatchlists = async () => {
    try {
      const res = await fetch("/api/watchlists");
      if (res.ok) {
        const data = await res.json();
        setWatchlists(data);
      }
    } catch (err) {
      console.error("Failed to fetch watchlists:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setLoadingHistory(true);
        setLoadingWatchlists(true);
        const [hRes, wRes] = await Promise.all([
          fetch("/api/history"),
          fetch("/api/watchlists"),
        ]);
        if (!ignore && hRes.ok) {
          const hData = await hRes.json();
          setHistory(hData);
        }
        if (!ignore && wRes.ok) {
          const wData = await wRes.json();
          setWatchlists(wData);
        }
      } catch (err) {
        console.error("Failed to load initial MyList data:", err);
      } finally {
        if (!ignore) {
          setLoadingHistory(false);
          setLoadingWatchlists(false);
        }
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleTabChange = (tab: "history" | "watchlists") => {
    setActiveTab(tab);
    if (tab === "history") refreshHistory();
    if (tab === "watchlists") refreshWatchlists();
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your entire watch history?")) return;
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleRemoveHistoryItem = async (videoId: string) => {
    try {
      const res = await fetch(`/api/history/${videoId}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.videoId !== videoId));
      }
    } catch (err) {
      console.error("Failed to remove history item:", err);
    }
  };

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      setCreatingList(true);
      setError("");
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      });

      if (res.ok) {
        setNewListName("");
        refreshWatchlists();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create watchlist.");
      }
    } catch {
      setError("Failed to create watchlist.");
    } finally {
      setCreatingList(false);
    }
  };

  const handleDeleteWatchlist = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this watchlist?")) return;
    try {
      const res = await fetch(`/api/watchlists/${listId}`, { method: "DELETE" });
      if (res.ok) {
        setWatchlists((prev) => prev.filter((w) => w.id !== listId));
      }
    } catch (err) {
      console.error("Failed to delete watchlist:", err);
    }
  };

  const handleRemoveWatchlistItem = async (listId: string, videoId: string) => {
    try {
      const res = await fetch(`/api/watchlists/${listId}/items?videoId=${videoId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWatchlists((prev) =>
          prev.map((w) =>
            w.id === listId
              ? { ...w, items: w.items.filter((item) => item.videoId !== videoId) }
              : w
          )
        );
      }
    } catch (err) {
      console.error("Failed to remove item from watchlist:", err);
    }
  };

  const handleTogglePublic = async (list: Watchlist) => {
    const nextPublic = !list.isPublic;
    try {
      const res = await fetch(`/api/watchlists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextPublic }),
      });
      if (res.ok) {
        setWatchlists((prev) =>
          prev.map((w) => (w.id === list.id ? { ...w, isPublic: nextPublic } : w))
        );
      }
    } catch (err) {
      console.error("Failed to toggle public status:", err);
    }
  };

  function formatTime(seconds: number): string {
    const totalSecs = Math.floor(seconds);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleTabChange("history")}
            className={`pb-2 text-sm sm:text-base font-bold flex items-center gap-2 transition-colors relative ${
              activeTab === "history"
                ? "text-white border-b-2 border-[#E50914]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Clock className="w-4 h-4 text-[#E50914]" />
            Watch History ({history.length})
          </button>

          <button
            onClick={() => handleTabChange("watchlists")}
            className={`pb-2 text-sm sm:text-base font-bold flex items-center gap-2 transition-colors relative ${
              activeTab === "watchlists"
                ? "text-white border-b-2 border-amber-500"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            Custom Watchlists ({watchlists.length})
          </button>
        </div>

        {activeTab === "history" && history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs font-semibold text-neutral-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {/* ── TAB 1: WATCH HISTORY ── */}
      {activeTab === "history" && (
        <div>
          {loadingHistory ? (
            <div className="py-8 text-center text-neutral-500 text-xs">Loading watch history...</div>
          ) : history.length === 0 ? (
            <div className="p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md text-center">
              <p className="text-neutral-500 text-xs font-semibold">Your watch history is empty.</p>
              <p className="text-neutral-600 text-xs mt-1">Videos you watch beyond 5 seconds will automatically appear here.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/25 hover:border-neutral-700/60 hover:bg-neutral-900/40 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 flex flex-col"
                >
                  <Link href={`/videos/${item.videoId}`} className="relative">
                    <div className="aspect-video bg-neutral-950/40 border-b border-neutral-900/60 flex items-center justify-center text-neutral-600 text-3xl relative overflow-hidden shrink-0">
                      <span className="group-hover:scale-110 group-hover:text-[#E50914] transition-all duration-300">▶</span>
                      {item.lastPosition > 0 && (
                        <span className="absolute bottom-2 right-2 bg-black/85 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-500/30">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Stopped at {formatTime(item.lastPosition)}</span>
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      <Link
                        href={`/videos/${item.videoId}`}
                        className="font-bold text-xs text-neutral-100 line-clamp-1 hover:text-[#E50914] transition-colors"
                      >
                        {item.videoTitle}
                      </Link>
                      <p className="text-[11px] text-neutral-400 mt-1 font-medium">
                        {item.uploaderName || "Unknown"} · Watched {timeAgo(item.watchedAt)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                      <Link
                        href={`/videos/${item.videoId}`}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Resume</span>
                      </Link>
                      <button
                        onClick={() => handleRemoveHistoryItem(item.videoId)}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CUSTOM WATCHLISTS ── */}
      {activeTab === "watchlists" && (
        <div className="space-y-6">
          {/* Create New Watchlist Bar */}
          <form onSubmit={handleCreateWatchlist} className="bg-[#181818] border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="Create a new watchlist (e.g. Coding Tutorials, Weekend Movies)..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1 bg-[#0f0f0f] border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={creatingList || !newListName.trim()}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create List</span>
            </button>
          </form>
          {error && <p className="text-xs text-red-400 px-1">{error}</p>}

          {loadingWatchlists ? (
            <div className="py-8 text-center text-neutral-500 text-xs">Loading custom watchlists...</div>
          ) : watchlists.length === 0 ? (
            <div className="p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-md text-center">
              <p className="text-neutral-500 text-xs font-semibold">No custom watchlists created yet.</p>
              <p className="text-neutral-600 text-xs mt-1">Use the bar above to create custom lists or save videos from the watch page.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {watchlists.map((list) => (
                <div key={list.id} className="bg-[#181818] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ListVideo className="w-4 h-4 text-amber-500" />
                      <Link
                        href={`/playlists/${list.id}`}
                        className="font-bold text-base text-white hover:text-amber-400 transition-colors"
                      >
                        {list.name}
                      </Link>
                      <span className="text-xs text-neutral-400 font-medium">({list.items.length} videos)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleTogglePublic(list)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            list.isPublic
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                          }`}
                          title="Toggle Public visibility on /videos browse page"
                        >
                          {list.isPublic ? "🌐 Public (Published)" : "🔒 Private (Draft)"}
                        </button>
                      )}

                      <Link
                        href={`/playlists/${list.id}`}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        View Playlist →
                      </Link>

                      <button
                        onClick={() => handleDeleteWatchlist(list.id)}
                        className="text-xs font-semibold text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors ml-2"
                        title="Delete Watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {list.items.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-3">No videos added to this list yet.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {list.items.map((item) => (
                        <div
                          key={item.itemId}
                          className="bg-[#0f0f0f] border border-neutral-800 hover:border-neutral-700 rounded-xl p-3 flex items-center justify-between gap-3 group transition-colors"
                        >
                          <Link href={`/videos/${item.videoId}`} className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-amber-500 shrink-0 font-bold text-xs">
                              ▶
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                                {item.videoTitle}
                              </p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                {item.uploaderName || "Unknown"}
                              </p>
                            </div>
                          </Link>

                          <button
                            onClick={() => handleRemoveWatchlistItem(list.id, item.videoId)}
                            className="p-1 rounded text-neutral-500 hover:text-red-400 transition-colors shrink-0"
                            title="Remove video from list"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
