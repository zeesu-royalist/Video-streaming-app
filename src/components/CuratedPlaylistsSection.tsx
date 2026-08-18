"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ListVideo, Play, Sparkles } from "lucide-react";

export interface PublicPlaylist {
  id: string;
  name: string;
  creatorName: string;
  createdAt: string;
  items: {
    videoId: string;
    videoTitle: string;
    videoFilePath: string;
  }[];
}

export default function CuratedPlaylistsSection() {
  const [playlists, setPlaylists] = useState<PublicPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadPublicPlaylists() {
      try {
        setLoading(true);
        const res = await fetch("/api/watchlists?public=true");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setPlaylists(data);
        }
      } catch (err) {
        console.error("Failed to fetch public curated playlists:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadPublicPlaylists();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading || playlists.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="font-serif text-2xl font-normal text-white">Admin Curated Playlists</h2>
        <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
          Featured
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((list) => {
          const firstVideo = list.items[0];
          return (
            <div
              key={list.id}
              className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/40 hover:border-amber-500/40 hover:bg-neutral-900/70 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-300 flex flex-col"
            >
              <Link
                href={
                  firstVideo
                    ? `/videos/${firstVideo.videoId}?playlistId=${list.id}`
                    : `/playlists/${list.id}`
                }
              >
                <div className="aspect-video bg-neutral-950 border-b border-neutral-900 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-12 h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/85 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                    <ListVideo className="w-3.5 h-3.5" />
                    <span>{list.items.length} Videos</span>
                  </span>
                </div>
              </Link>

              <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                <div>
                  <Link
                    href={`/playlists/${list.id}`}
                    className="font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1"
                  >
                    {list.name}
                  </Link>
                  <p className="text-xs text-neutral-400 mt-1">
                    Curated by <span className="text-neutral-200 font-semibold">{list.creatorName}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                  <Link
                    href={`/playlists/${list.id}`}
                    className="text-xs font-bold text-neutral-300 hover:text-white transition-colors"
                  >
                    View Playlist Details
                  </Link>
                  {firstVideo && (
                    <Link
                      href={`/videos/${firstVideo.videoId}?playlistId=${list.id}`}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch All</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
