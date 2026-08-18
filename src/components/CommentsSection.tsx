"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimestamp } from "@/lib/format";

export { formatTimestamp };

export type Comment = {
  id: string;
  text: string;
  startTime: number | null;
  endTime: number | null;
  createdAt: string;
  userId: string;
  userName: string | null;
};

export default function CommentsSection({
  videoId,
  isLoggedIn,
  currentTime = 0,
  onSeek,
}: {
  videoId: string;
  isLoggedIn: boolean;
  currentTime?: number;
  onSeek?: (timeInSeconds: number) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timestamp creation options
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState<number>(0);
  const [durationPreset, setDurationPreset] = useState<"5" | "10" | "15" | "custom">("10");
  const [customEndTime, setCustomEndTime] = useState<number>(10);

  useEffect(() => {
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [videoId]);

  // Calculated endTime based on preset or custom input
  const computedEndTime =
    durationPreset === "custom"
      ? customEndTime
      : startTimeInput + parseInt(durationPreset, 10);

  // Validation
  const isTimeInvalid =
    includeTimestamp && (startTimeInput < 0 || computedEndTime <= startTimeInput);

  // Auto-capture timestamp on first text typing if user hasn't explicitly set it
  function handleTextChange(val: string) {
    setText(val);
    if (val.trim() && !includeTimestamp) {
      const capturedStart = Math.floor(currentTime);
      setIncludeTimestamp(true);
      setStartTimeInput(capturedStart);
      setCustomEndTime(capturedStart + 10);
      setDurationPreset("10");
    }
  }

  function handleEnableTimestamp() {
    const capturedStart = Math.floor(currentTime);
    setIncludeTimestamp(true);
    setStartTimeInput(capturedStart);
    setCustomEndTime(capturedStart + 10);
    setDurationPreset("10");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (isTimeInvalid) {
      setErrorMsg("End time must be strictly greater than start time.");
      return;
    }

    setErrorMsg(null);
    setPosting(true);

    const payload: { text: string; startTime?: number; endTime?: number } = {
      text: text.trim(),
    };

    if (includeTimestamp) {
      payload.startTime = startTimeInput;
      payload.endTime = computedEndTime;
    }

    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setPosting(false);

      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setText("");
        setIncludeTimestamp(false);
      } else {
        setErrorMsg(data.error ?? "Failed to post comment");
      }
    } catch {
      setPosting(false);
      setErrorMsg("An unexpected error occurred.");
    }
  }

  // Active comments logic: startTime <= currentTime <= endTime
  const activeComments = comments.filter(
    (c) =>
      c.startTime !== null &&
      c.endTime !== null &&
      c.startTime <= currentTime &&
      currentTime <= c.endTime
  ).sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

  const activeIds = new Set(activeComments.map((c) => c.id));

  // Normal comments: non-timestamped or timestamped but not currently active
  const normalComments = comments.filter((c) => !activeIds.has(c.id));

  return (
    <div className="p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/20 backdrop-blur-md shadow-lg transition-all">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-semibold text-white">
          Comments ({comments.length})
        </h2>
        {currentTime > 0 && (
          <span className="text-xs font-mono font-medium text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-full border border-neutral-700/60">
            Playback: {formatTimestamp(currentTime)}
          </span>
        )}
      </div>

      {/* Comment Form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Write a time-synced comment..."
              className="flex-1 rounded-xl bg-neutral-950/60 border border-neutral-800 px-4 py-2.5 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
            />
            <button
              disabled={posting || isTimeInvalid || !text.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b8070f] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-[0_4px_14px_rgba(229,9,20,0.25)] shrink-0 cursor-pointer"
            >
              Post
            </button>
          </div>

          {/* Timestamp Toggle & Settings */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-neutral-950/40 border border-neutral-850 p-3 rounded-xl">
            {!includeTimestamp ? (
              <button
                type="button"
                onClick={handleEnableTimestamp}
                className="flex items-center gap-1.5 text-neutral-400 hover:text-red-400 font-semibold transition-colors cursor-pointer"
              >
                <span className="text-sm">⏱️</span>
                Tag current time ({formatTimestamp(currentTime)})
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 w-full justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-red-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                    Range:
                  </span>

                  {/* Start time adjustment */}
                  <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                    <span className="text-neutral-400">Start:</span>
                    <input
                      type="number"
                      min={0}
                      value={startTimeInput}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setStartTimeInput(val);
                        if (durationPreset === "custom" && customEndTime <= val) {
                          setCustomEndTime(val + 5);
                        }
                      }}
                      className="w-14 bg-transparent text-white font-mono text-center focus:outline-none"
                    />
                    <span className="text-neutral-500 font-mono">({formatTimestamp(startTimeInput)})</span>
                  </div>

                  {/* Duration Presets */}
                  <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded border border-neutral-800">
                    {(["5", "10", "15"] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDurationPreset(preset)}
                        className={`px-2 py-0.5 rounded font-medium transition-all ${
                          durationPreset === preset
                            ? "bg-[#E50914] text-white"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        +{preset}s
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setDurationPreset("custom");
                        if (customEndTime <= startTimeInput) {
                          setCustomEndTime(startTimeInput + 10);
                        }
                      }}
                      className={`px-2 py-0.5 rounded font-medium transition-all ${
                        durationPreset === "custom"
                          ? "bg-[#E50914] text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Custom End Time Input */}
                  {durationPreset === "custom" && (
                    <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                      <span className="text-neutral-400">End:</span>
                      <input
                        type="number"
                        min={startTimeInput + 1}
                        value={customEndTime}
                        onChange={(e) =>
                          setCustomEndTime(parseInt(e.target.value, 10) || startTimeInput + 1)
                        }
                        className="w-14 bg-transparent text-white font-mono text-center focus:outline-none"
                      />
                      <span className="text-neutral-500 font-mono">({formatTimestamp(customEndTime)})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-neutral-300 font-mono bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-800">
                    Active: {formatTimestamp(startTimeInput)} → {formatTimestamp(computedEndTime)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIncludeTimestamp(false)}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors"
                    title="Remove timestamp"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Validation Error Banner */}
          {isTimeInvalid && (
            <p className="text-red-400 text-xs font-semibold mt-1">
              ⚠️ End time ({formatTimestamp(computedEndTime)}) must be strictly greater than start time ({formatTimestamp(startTimeInput)}).
            </p>
          )}

          {errorMsg && (
            <p className="text-red-400 text-xs font-semibold mt-1">{errorMsg}</p>
          )}
        </form>
      ) : (
        <p className="text-xs font-medium text-neutral-500 mb-8">
          Please{" "}
          <Link
            href="/login"
            className="text-[#E50914] hover:text-red-400 hover:underline font-bold transition-colors"
          >
            login
          </Link>{" "}
          to participate in the comments section.
        </p>
      )}

      {/* Loading state */}
      {loading ? (
        <p className="text-neutral-500 text-xs font-medium">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-neutral-500 text-xs font-medium">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ════════════════════════════════════════════════════════
              ACTIVE / HIGHLIGHTED COMMENTS SECTION
          ════════════════════════════════════════════════════════ */}
          <AnimatePresence mode="popLayout">
            {activeComments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/30 via-neutral-900/80 to-red-950/20 border border-red-500/40 shadow-[0_0_20px_rgba(229,9,20,0.15)] relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E50914]"></span>
                    </span>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Active Now ({formatTimestamp(currentTime)})
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {activeComments.map((c) => (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => c.startTime !== null && onSeek?.(c.startTime)}
                        className="p-3 rounded-xl bg-neutral-950/80 border border-red-500/30 hover:border-red-500/70 transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E50914] to-red-700 text-white shadow-[0_0_8px_rgba(229,9,20,0.4)] flex items-center justify-center text-xs font-extrabold shrink-0">
                            {c.userName?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {c.userName ?? "Unknown"}
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400">
                                  {new Date(c.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-md border border-red-800/60 group-hover:bg-red-900 group-hover:text-white transition-colors">
                                ⏱️ {formatTimestamp(c.startTime)} - {formatTimestamp(c.endTime)}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-neutral-200 mt-1 leading-relaxed">
                              {c.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════════════════════════════════════════════════
              NORMAL COMMENTS LIST
          ════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {normalComments.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-4 items-start p-2.5 rounded-xl hover:bg-neutral-900/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E50914] to-red-700 text-white shadow-[0_0_8px_rgba(229,9,20,0.3)] flex items-center justify-center text-xs font-extrabold shrink-0">
                    {c.userName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-neutral-200">
                        {c.userName ?? "Unknown"}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                      {c.startTime !== null && (
                        <button
                          type="button"
                          onClick={() => onSeek?.(c.startTime!)}
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-neutral-300 bg-neutral-800 hover:bg-[#E50914] hover:text-white px-2 py-0.5 rounded transition-all cursor-pointer"
                        >
                          ⏱️ {formatTimestamp(c.startTime)}
                          {c.endTime !== null ? ` - ${formatTimestamp(c.endTime)}` : ""}
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-medium text-neutral-400 mt-1 leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}
