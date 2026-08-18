"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type VideoPlayerRef = {
  seekTo: (timeInSeconds: number) => void;
  getCurrentTime: () => number;
};

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  className?: string;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ src, onTimeUpdate, onLoadedMetadata, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (timeInSeconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = timeInSeconds;
          videoRef.current.play().catch(() => {});
          if (onTimeUpdate) {
            onTimeUpdate(timeInSeconds);
          }
        }
      },
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    }));

    const handleTimeUpdate = () => {
      if (videoRef.current && onTimeUpdate) {
        onTimeUpdate(videoRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current && onLoadedMetadata && videoRef.current.duration) {
        onLoadedMetadata(videoRef.current.duration);
      }
    };

    return (
      <video
        ref={videoRef}
        src={src}
        controls
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleTimeUpdate}
        onSeeked={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className={className ?? "w-full aspect-video bg-black object-contain"}
      />
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
