"use client";

import { useState, useEffect } from "react";
import { Plus, Lock, Globe, Trash2, Edit2, Check, X, Search } from "lucide-react";

export interface NoteItem {
  id: string;
  videoId: string;
  userId: string;
  userName?: string | null;
  content: string;
  timestamp: number;
  isPublic: boolean;
  createdAt: string;
}

interface VideoNotesSectionProps {
  videoId: string;
  currentUserId?: string;
  userRole?: string;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export default function VideoNotesSection({
  videoId,
  currentUserId,
  userRole,
  currentTime,
  onSeek,
}: VideoNotesSectionProps) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Note creation state
  const [isAdding, setIsAdding] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [capturedTime, setCapturedTime] = useState<number>(0);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<"ALL" | "MY" | "PUBLIC">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const MAX_CHARS = 1000;

  function formatTime(seconds: number): string {
    const totalSecs = Math.floor(seconds);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  useEffect(() => {
    let ignore = false;
    async function loadNotes() {
      try {
        setLoading(true);
        const res = await fetch(`/api/videos/${videoId}/notes`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setNotes(data);
        }
      } catch (err) {
        console.error("Failed to load notes:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadNotes();
    return () => {
      ignore = true;
    };
  }, [videoId]);

  const refreshNotes = async () => {
    try {
      const res = await fetch(`/api/videos/${videoId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Failed to refresh notes:", err);
    }
  };

  const handleOpenAddNote = () => {
    if (!currentUserId) {
      setError("Please log in to add notes.");
      return;
    }
    setCapturedTime(Math.floor(currentTime));
    setIsAdding(true);
    setError("");
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (noteText.length > MAX_CHARS) {
      setError(`Note cannot exceed ${MAX_CHARS} characters.`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const res = await fetch(`/api/videos/${videoId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteText.trim(),
          timestamp: capturedTime,
          isPublic,
        }),
      });

      if (res.ok) {
        setNoteText("");
        setIsAdding(false);
        setIsPublic(false);
        refreshNotes();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create note.");
      }
    } catch {
      setError("Failed to save note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleStartEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setEditText(note.content);
    setEditIsPublic(note.isPublic);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editText.trim(),
          isPublic: editIsPublic,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, ...updated } : n))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const handleTogglePrivacy = async (note: NoteItem) => {
    try {
      const newStatus = !note.isPublic;
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newStatus }),
      });
      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, isPublic: newStatus } : n))
        );
      }
    } catch (err) {
      console.error("Failed to toggle privacy:", err);
    }
  };

  // Filter notes logic
  const filteredNotes = notes.filter((n) => {
    if (filter === "MY") return n.userId === currentUserId;
    if (filter === "PUBLIC") return n.isPublic;
    return true; // ALL
  }).filter((n) =>
    searchQuery.trim() === ""
      ? true
      : n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.userName && n.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-white py-2">
      {/* ── Udemy-Style Create Note Bar ── */}
      {!isAdding ? (
        <div
          onClick={handleOpenAddNote}
          className="w-full bg-[#181818] border border-neutral-700/80 hover:border-neutral-500 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 group shadow-sm"
        >
          <span className="text-neutral-400 text-sm font-medium">
            Create a new note at{" "}
            <span className="text-amber-400 font-bold underline underline-offset-2">
              {formatTime(currentTime)}
            </span>
          </span>
          <div className="w-7 h-7 rounded-full bg-[#272727] group-hover:bg-[#3f3f3f] flex items-center justify-center text-white transition-colors">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleCreateNote}
          className="bg-[#181818] border border-neutral-700 rounded-xl p-4 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 rounded text-xs">
                Timestamp: {formatTime(capturedTime)}
              </span>
            </div>
            <span
              className={`text-xs ${
                noteText.length > MAX_CHARS ? "text-red-400 font-bold" : "text-neutral-400"
              }`}
            >
              {MAX_CHARS - noteText.length} characters left
            </span>
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            maxLength={MAX_CHARS}
            placeholder="Type your note here (up to 1,000 characters)..."
            rows={4}
            className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neutral-500 resize-none"
            autoFocus
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                {isPublic ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                {isPublic ? "Public (Visible to everyone)" : "Private (Only for me)"}
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNoteText("");
                }}
                className="px-3.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !noteText.trim()}
                className="px-4 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </form>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              filter === "ALL"
                ? "bg-white text-black"
                : "bg-[#272727] hover:bg-[#3f3f3f] text-neutral-300"
            }`}
          >
            All Notes ({notes.length})
          </button>
          {currentUserId && (
            <button
              onClick={() => setFilter("MY")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                filter === "MY"
                  ? "bg-white text-black"
                  : "bg-[#272727] hover:bg-[#3f3f3f] text-neutral-300"
              }`}
            >
              My Notes ({notes.filter((n) => n.userId === currentUserId).length})
            </button>
          )}
          <button
            onClick={() => setFilter("PUBLIC")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              filter === "PUBLIC"
                ? "bg-white text-black"
                : "bg-[#272727] hover:bg-[#3f3f3f] text-neutral-300"
            }`}
          >
            Public Notes ({notes.filter((n) => n.isPublic).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181818] border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>

      {/* ── Notes List ── */}
      {loading ? (
        <div className="py-8 text-center text-neutral-500 text-sm">Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-neutral-800 rounded-xl">
          <p className="text-sm font-medium text-neutral-400">No notes found.</p>
          <p className="text-xs text-neutral-500 mt-1">
            Click &quot;Create a new note&quot; above to capture moments in this video.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const isOwner = note.userId === currentUserId;
            const canManage = isOwner || userRole === "SUPER_ADMIN";
            const isEditing = editingId === note.id;

            return (
              <div
                key={note.id}
                className="bg-[#181818] border border-neutral-800 hover:border-neutral-700/80 rounded-xl p-4 transition-all duration-200 shadow-sm space-y-2.5"
              >
                {/* Header row with timestamp badge & action tools */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Timestamp Jump Badge */}
                    <button
                      onClick={() => onSeek(note.timestamp)}
                      className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors"
                      title="Jump to video timestamp"
                    >
                      <span>▶</span>
                      <span>{formatTime(note.timestamp)}</span>
                    </button>

                    {/* Author Badge */}
                    <span className="text-xs text-neutral-400 font-medium">
                      {note.userName || "Student"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Privacy Badge */}
                    <button
                      onClick={() => canManage && handleTogglePrivacy(note)}
                      disabled={!canManage}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border transition-colors ${
                        note.isPublic
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                      } ${!canManage && "cursor-default"}`}
                      title={canManage ? "Click to toggle privacy" : "Privacy status"}
                    >
                      {note.isPublic ? (
                        <>
                          <Globe className="w-3 h-3" /> Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> Private
                        </>
                      )}
                    </button>

                    {/* Owner Management Buttons */}
                    {canManage && !isEditing && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          title="Edit Note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1.5 rounded-md hover:bg-red-950/50 text-neutral-400 hover:text-red-400 transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content area */}
                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={MAX_CHARS}
                      rows={3}
                      className="w-full bg-[#0f0f0f] border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-300">
                        <input
                          type="checkbox"
                          checked={editIsPublic}
                          onChange={(e) => setEditIsPublic(e.target.checked)}
                          className="rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <span>Public Note</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
