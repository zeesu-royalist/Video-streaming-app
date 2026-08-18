"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import VideoPlayer, { VideoPlayerRef } from "@/components/VideoPlayer";
import CommentsSection from "@/components/CommentsSection";
import DeleteVideoButton from "@/components/DeleteVideoButton";
import MoreOptionsButton from "@/components/MoreOptionsButton";

import { formatTimestamp, formatTimeAgo, getVideoThumbnailUrl } from "@/lib/format";

export type VideoData = {
  id: string;
  title: string;
  description: string | null;
  filePath: string;
  thumbnailPath?: string | null;
  duration?: number | null;
  createdAt: string;
  uploaderId: string;
  uploaderName: string | null;
};

export type RecommendedVideo = {
  id: string;
  title: string;
  filePath?: string;
  thumbnailPath?: string | null;
  duration?: number | null;
  createdAt: string;
  uploaderName: string | null;
};

export default function WatchVideoClient({
  video,
  recommendedVideos,
  canDelete,
  isLoggedIn,
}: {
  video: VideoData;
  recommendedVideos: RecommendedVideo[];
  canDelete: boolean;
  isLoggedIn: boolean;
}) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number | null>(video.duration ?? null);
  const playerRef = useRef<VideoPlayerRef>(null);

  const handleSeek = (timeInSeconds: number) => {
    playerRef.current?.seekTo(timeInSeconds);
  };

  const handleLoadedMetadata = (dur: number) => {
    const rounded = Math.round(dur);
    if (!videoDuration || videoDuration !== rounded) {
      setVideoDuration(rounded);
      fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: rounded }),
      }).catch(() => {});
    }
  };

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

  // Action buttons bar
  const actionButtons = (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
      <div className="flex items-center bg-[#272727] hover:bg-[#3f3f3f] rounded-full overflow-hidden shrink-0 transition-colors">
        <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors border-r border-neutral-700/60 cursor-pointer">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2.06z" />
          </svg>
          952
        </button>
        <button
          className="px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Dislike"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
          </svg>
        </button>
      </div>

      <button className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shrink-0 transition-colors cursor-pointer">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
        </svg>
        Share
      </button>

      <button className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shrink-0 transition-colors cursor-pointer">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
        </svg>
        Ask
      </button>

      <button className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shrink-0 transition-colors cursor-pointer">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        </svg>
        Save
      </button>

      <button
        className="flex items-center justify-center bg-[#272727] hover:bg-[#3f3f3f] rounded-full p-2.5 text-white shrink-0 transition-colors cursor-pointer"
        title="More actions"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {canDelete && <DeleteVideoButton videoId={video.id} />}
    </div>
  );

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
      <div className="shrink-0 pl-1 text-neutral-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="-mt-6 bg-[#0f0f0f] min-h-screen text-white">
      <div className="max-w-[1750px] mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-4">
        {/* MOBILE LAYOUT (< lg) */}
        <div className="flex flex-col lg:hidden">
          <div className="w-full aspect-video bg-black overflow-hidden">
            <VideoPlayer
              ref={playerRef}
              src={video.filePath}
              onTimeUpdate={setCurrentTime}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </div>

          <div className="px-3 sm:px-0">
            <h1 className="mt-3 text-lg font-bold text-white leading-tight">
              {video.title}
            </h1>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E50914] to-red-700 p-[1px] shrink-0 shadow-[0_0_8px_rgba(229,9,20,0.3)]">
                  <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center font-bold text-white text-sm select-none">
                    {video.uploaderName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate leading-none">
                    {video.uploaderName || "Unknown Uploader"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">71.6K subscribers</p>
                </div>
              </div>
              <button className="bg-white hover:bg-neutral-200 text-black font-semibold rounded-full px-4 py-1.5 text-xs shrink-0 transition-colors">
                Subscribe
              </button>
            </div>

            <div className="mt-3">{actionButtons}</div>

            <div className="mt-3 bg-neutral-900/25 border border-neutral-850 hover:bg-neutral-900/40 rounded-2xl p-4 text-xs text-neutral-200 cursor-pointer transition-all duration-300 shadow-md">
              <p className="font-bold text-white text-xs mb-1">
                19K views · {timeAgo(video.createdAt)} · #btechLife #codingForBeginners
              </p>
              <p className="text-neutral-300 text-xs leading-relaxed line-clamp-3">
                {video.description?.trim() || "No description provided."}
              </p>
            </div>

            <div className="mt-6 border-t border-neutral-800/80 pt-4">
              <CommentsSection
                videoId={video.id}
                isLoggedIn={isLoggedIn}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            </div>            <div className="mt-8 border-t border-neutral-800/80 pt-6 pb-12">
              {filterPills}
              {recommendedVideos.length === 0 ? (
                <p className="text-sm text-neutral-500 py-2">No other videos available.</p>
              ) : (
                <div className="flex flex-col gap-6 mt-3">
                  {recommendedVideos.map((v) => {
                    const thumbUrl = v.thumbnailPath || (v.filePath ? getVideoThumbnailUrl(v.filePath) : "");
                    return (
                      <Link key={v.id} href={`/videos/${v.id}`} className="group flex flex-col gap-2">
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-neutral-950/60 border border-neutral-900/80 relative flex items-center justify-center">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={v.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-neutral-500 text-4xl group-hover:text-[#E50914] group-hover:scale-110 transition-all duration-300">
                              ▶
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <div className="w-10 h-10 rounded-full bg-[#E50914]/90 text-white flex items-center justify-center pl-0.5 shadow-md">
                              ▶
                            </div>
                          </div>
                          {v.duration !== undefined && v.duration !== null && (
                            <span className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-mono font-medium px-1.5 py-0.5 rounded shadow">
                              {formatTimestamp(v.duration)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 px-1">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E50914] to-red-700 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-[0_0_6px_rgba(229,9,20,0.3)]">
                            {v.uploaderName?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#E50914] transition-colors duration-200">
                              {v.title}
                            </h3>
                            <p className="text-xs text-neutral-400 mt-1">
                              {v.uploaderName || "Unknown"} · 4.6K views · {timeAgo(v.createdAt)}
                            </p>
                          </div>
                          <MoreOptionsButton />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT (>= lg) */}
        <div className="hidden lg:flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
              <VideoPlayer
                ref={playerRef}
                src={video.filePath}
                onTimeUpdate={setCurrentTime}
                onLoadedMetadata={handleLoadedMetadata}
              />
            </div>

            <h1 className="mt-3.5 text-xl font-bold text-white leading-snug tracking-tight">
              {video.title}
            </h1>

            <div className="mt-3 flex items-center justify-between flex-wrap gap-4 pb-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E50914] to-red-700 p-[1px] shrink-0 shadow-[0_0_8px_rgba(229,9,20,0.3)]">
                  <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center font-bold text-white text-base select-none">
                    {video.uploaderName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                </div>
                <div>
                  <p className="text-base font-bold text-white leading-none">
                    {video.uploaderName || "Unknown Uploader"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1.5 font-semibold">71.6K subscribers</p>
                </div>
                <button className="bg-white hover:bg-neutral-200 text-black font-semibold rounded-full px-4 py-2 text-sm ml-2 transition-colors shrink-0">
                  Subscribe
                </button>
              </div>

              {actionButtons}
            </div>

            <div className="mt-3 bg-neutral-900/25 border border-neutral-850 hover:bg-neutral-900/40 rounded-2xl p-4.5 text-sm text-neutral-200 cursor-pointer transition-all duration-300 shadow-md">
              <p className="font-bold text-white text-sm mb-1">
                19K views · {timeAgo(video.createdAt)} · #btechLife #codingForBeginners
              </p>
              <p className="text-neutral-300 text-sm leading-relaxed line-clamp-3">
                {video.description?.trim() || "No description provided."}
              </p>
            </div>

            <div className="mt-6">
              <CommentsSection
                videoId={video.id}
                isLoggedIn={isLoggedIn}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            </div>
          </div>

          {/* Right Sidebar (402px) */}
          <aside className="w-[402px] shrink-0">
            {filterPills}

            {recommendedVideos.length === 0 ? (
              <p className="text-sm text-neutral-500 py-2">No other videos available.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recommendedVideos.map((v) => {
                  const thumbUrl = v.thumbnailPath || (v.filePath ? getVideoThumbnailUrl(v.filePath) : "");
                  return (
                    <Link
                      key={v.id}
                      href={`/videos/${v.id}`}
                      className="group flex gap-3 rounded-2xl p-2 hover:bg-white/[0.04] border border-transparent hover:border-neutral-850 hover:shadow-md transition-all duration-300"
                    >
                      <div
                        className="relative shrink-0 rounded-xl overflow-hidden bg-neutral-950/60 border border-neutral-900/80 flex items-center justify-center"
                        style={{ width: "168px", minWidth: "168px", height: "94px" }}
                      >
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={v.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-neutral-500 text-2xl group-hover:text-[#E50914] group-hover:scale-110 transition-all duration-300">
                            ▶
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          <div className="w-7 h-7 rounded-full bg-[#E50914]/90 text-white text-xs flex items-center justify-center pl-0.5 shadow-md">
                            ▶
                          </div>
                        </div>
                        {v.duration !== undefined && v.duration !== null && (
                          <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                            {formatTimestamp(v.duration)}
                          </span>
                        )}
                      </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-start py-0.5">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 leading-[1.3] group-hover:text-[#E50914]">
                        {v.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                        {v.uploaderName || "Unknown"}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        4.6K views · {timeAgo(v.createdAt)}
                      </p>
                    </div>

                    <MoreOptionsButton />
                  </Link>
                );
              })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
