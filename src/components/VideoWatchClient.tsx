"use client";

import { useState, useRef } from "react";
import CommentsSection from "@/components/CommentsSection";
import VideoNotesSection from "@/components/VideoNotesSection";
import DeleteVideoButton from "@/components/DeleteVideoButton";
import Link from "next/link";
import MoreOptionsButton from "@/components/MoreOptionsButton";
import { MessageSquare, FileText, Info, Bookmark, ChevronLeft, ChevronRight, ListVideo } from "lucide-react";
import SaveToWatchlistModal from "@/components/SaveToWatchlistModal";

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  filePath: string;
  createdAt: string;
  uploaderId: string;
  uploaderName: string | null;
}

interface RecommendedVideo {
  id: string;
  title: string;
  createdAt: string;
  uploaderName: string | null;
}

interface PlaylistContextData {
  id: string;
  name: string;
  items: { videoId: string; videoTitle: string }[];
}

interface VideoWatchClientProps {
  video: VideoData;
  recommendedVideos: RecommendedVideo[];
  playlistContext?: PlaylistContextData | null;
  sessionUser?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
}

export default function VideoWatchClient({
  video,
  recommendedVideos,
  playlistContext,
  sessionUser,
}: VideoWatchClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"overview" | "comments" | "notes">("overview");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const lastLoggedTimeRef = useRef<number>(0);

  const canDelete = sessionUser?.role === "SUPER_ADMIN";

  // Playlist navigation calculation
  const playlistItems = playlistContext?.items || [];
  const currentPlaylistIdx = playlistItems.findIndex((item) => item.videoId === video.id);
  const prevPlaylistItem = currentPlaylistIdx > 0 ? playlistItems[currentPlaylistIdx - 1] : null;
  const nextPlaylistItem =
    currentPlaylistIdx >= 0 && currentPlaylistIdx < playlistItems.length - 1
      ? playlistItems[currentPlaylistIdx + 1]
      : null;

  // Auto-log watch history for logged in users
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const nowSecs = videoRef.current.currentTime;
    setCurrentTime(nowSecs);

    if (sessionUser?.id && nowSecs >= 5 && Math.abs(nowSecs - lastLoggedTimeRef.current) >= 10) {
      lastLoggedTimeRef.current = nowSecs;
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          position: Math.floor(nowSecs),
        }),
      }).catch((err) => console.error("Failed to log watch history:", err));
    }
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  // Category filter pills bar for recommended videos
  const filterPills = (
    <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
      <button className="shrink-0 px-3 py-1 rounded-lg bg-white text-black text-xs font-semibold">
        All
      </button>
      {video.uploaderName && (
        <button className="shrink-0 px-3 py-1 rounded-lg bg-[#272727] hover:bg-[#3f3f3f] text-white text-xs font-medium transition-colors">
          From {video.uploaderName}
        </button>
      )}
      <button className="shrink-0 px-3 py-1 rounded-lg bg-[#272727] hover:bg-[#3f3f3f] text-white text-xs font-medium transition-colors">
        Web Development
      </button>
      <button className="shrink-0 px-3 py-1 rounded-lg bg-[#272727] hover:bg-[#3f3f3f] text-white text-xs font-medium transition-colors">
        Software Engineering
      </button>
    </div>
  );

  return (
    <div className="-mt-6 bg-[#0f0f0f] min-h-screen text-white">
      <div className="max-w-[1750px] mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-4">
        
        {/* Main 2-Column Grid */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left Main Column: Video Player + 3 Tabs ── */}
          <div className="flex-1 min-w-0">
            
            {/* Playlist Context Banner */}
            {playlistContext && (
              <div className="mb-3 px-4 py-3 bg-[#181818] border border-amber-500/30 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ListVideo className="w-4 h-4 text-amber-500" />
                  <span className="text-neutral-400">Playing from playlist:</span>
                  <Link
                    href={`/playlists/${playlistContext.id}`}
                    className="font-bold text-white hover:text-amber-400 transition-colors"
                  >
                    {playlistContext.name}
                  </Link>
                  {currentPlaylistIdx >= 0 && (
                    <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">
                      {currentPlaylistIdx + 1} of {playlistItems.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {prevPlaylistItem ? (
                    <Link
                      href={`/videos/${prevPlaylistItem.videoId}?playlistId=${playlistContext.id}`}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-600 text-xs font-bold flex items-center gap-1 cursor-not-allowed">
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </span>
                  )}

                  {nextPlaylistItem ? (
                    <Link
                      href={`/videos/${nextPlaylistItem.videoId}?playlistId=${playlistContext.id}`}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Next Video</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-600 text-xs font-bold flex items-center gap-1 cursor-not-allowed">
                      <span>Next Video</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Video Player */}
            <div className="w-full aspect-video bg-black sm:rounded-xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                src={video.filePath}
                controls
                onTimeUpdate={handleTimeUpdate}
                className="w-full aspect-video bg-black object-contain"
              />
            </div>

            {/* ── 3 Tabs Header (Overview / Comments / Notes) ── */}
            <div className="mt-4 px-3 sm:px-0 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-3 font-bold text-sm sm:text-base flex items-center gap-2 transition-colors relative ${
                    activeTab === "overview"
                      ? "text-white border-b-2 border-amber-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <Info className="w-4 h-4" />
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("comments")}
                  className={`pb-3 font-bold text-sm sm:text-base flex items-center gap-2 transition-colors relative ${
                    activeTab === "comments"
                      ? "text-white border-b-2 border-amber-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Comments
                </button>

                <button
                  onClick={() => setActiveTab("notes")}
                  className={`pb-3 font-bold text-sm sm:text-base flex items-center gap-2 transition-colors relative ${
                    activeTab === "notes"
                      ? "text-white border-b-2 border-amber-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Notes
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-extrabold ml-0.5">
                    Udemy
                  </span>
                </button>
              </div>

              {/* Save to Watchlist Action */}
              {sessionUser && (
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="pb-3 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  title="Save to custom list"
                >
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Save to List</span>
                </button>
              )}
            </div>

            {/* ── Tab Content Area ── */}
            <div className="mt-4 px-3 sm:px-0">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Title & Delete button */}
                  <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight">
                      {video.title}
                    </h1>
                    {canDelete && <DeleteVideoButton videoId={video.id} />}
                  </div>

                  {/* Video Description Box */}
                  <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4.5 text-sm text-neutral-200 shadow-md">
                    <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {video.description?.trim() || "No description provided."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: COMMENTS */}
              {activeTab === "comments" && (
                <div className="py-1">
                  <CommentsSection videoId={video.id} isLoggedIn={!!sessionUser} />
                </div>
              )}

              {/* TAB 3: NOTES (UDEMY-STYLE) */}
              {activeTab === "notes" && (
                <VideoNotesSection
                  videoId={video.id}
                  currentUserId={sessionUser?.id}
                  userRole={sessionUser?.role}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              )}

            </div>
          </div>

          {/* ── Right Sidebar: Recommended Videos (402px) ── */}
          <aside className="w-full lg:w-[402px] shrink-0 px-3 sm:px-0 mt-6 lg:mt-0">
            {filterPills}

            {recommendedVideos.length === 0 ? (
              <p className="text-sm text-neutral-500 py-2">No other videos available.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recommendedVideos.map((v) => (
                  <Link
                    key={v.id}
                    href={`/videos/${v.id}`}
                    className="group flex gap-3 rounded-2xl p-2 hover:bg-white/[0.04] border border-transparent hover:border-neutral-800 transition-all duration-300"
                  >
                    <div
                      className="relative shrink-0 rounded-xl overflow-hidden bg-neutral-950/40 border border-neutral-900 flex items-center justify-center"
                      style={{ width: "168px", minWidth: "168px", height: "94px" }}
                    >
                      <div className="text-neutral-500 text-2xl group-hover:text-[#E50914] group-hover:scale-110 transition-all duration-300">
                        ▶
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        14:30
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-start py-0.5">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 leading-[1.3] group-hover:text-[#E50914]">
                        {v.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        {v.uploaderName || "Unknown"}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        4.6K views · {timeAgo(v.createdAt)}
                      </p>
                    </div>

                    <MoreOptionsButton />
                  </Link>
                ))}
              </div>
            )}
          </aside>

        </div>
      </div>

      {/* Save to Watchlist Modal */}
      <SaveToWatchlistModal
        videoId={video.id}
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </div>
  );
}
