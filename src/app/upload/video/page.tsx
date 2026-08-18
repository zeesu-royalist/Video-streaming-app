"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadVideoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [eta, setEta] = useState("");
  const [byteStats, setByteStats] = useState("");

  const startTimeRef = useRef<number>(0);

  function uploadToCloudinary(
    url: string,
    formData: FormData,
    onProgress: (percent: number, loaded: number, total: number) => void
  ): Promise<{ ok: boolean; status: number; data: any }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
          onProgress(percent, event.loaded, event.total);
        }
      });

      xhr.addEventListener("load", () => {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            data,
          });
        } catch {
          resolve({
            ok: false,
            status: xhr.status,
            data: { error: "Failed to parse upload response from Cloudinary." },
          });
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error while uploading video to Cloudinary."));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted."));
      });

      xhr.open("POST", url);
      xhr.send(formData);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a video file.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadSpeed("");
    setEta("");
    setByteStats("");
    startTimeRef.current = Date.now();

    try {
      // Step 1: Request async signed upload token from backend
      const sigRes = await fetch("/api/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subfolder: "videos",
          fileType: file.type,
          fileName: file.name,
        }),
      });

      const sigData = await sigRes.json();
      if (!sigRes.ok) {
        throw new Error(sigData.error || "Failed to initialize upload session.");
      }

      const { timestamp, signature, apiKey, cloudName, folder, publicId, resourceType } = sigData;

      // Step 2: Upload file directly from browser to Cloudinary with async mode enabled
      const cloudFormData = new FormData();
      cloudFormData.append("file", file);
      cloudFormData.append("api_key", apiKey);
      cloudFormData.append("timestamp", timestamp.toString());
      cloudFormData.append("signature", signature);
      cloudFormData.append("folder", folder);
      cloudFormData.append("public_id", publicId);
      cloudFormData.append("async", "true");

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const cloudRes = await uploadToCloudinary(
        cloudinaryUrl,
        cloudFormData,
        (percent, loaded, total) => {
          setUploadProgress(percent);

          const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
          if (elapsedSec > 0.3) {
            const bytesPerSec = loaded / elapsedSec;
            if (bytesPerSec > 0) {
              const speedMBps = (bytesPerSec / (1024 * 1024)).toFixed(1);
              setUploadSpeed(`${speedMBps} MB/s`);

              const remainingBytes = total - loaded;
              const remainingSec = Math.ceil(remainingBytes / bytesPerSec);
              setEta(remainingSec > 0 ? `${remainingSec}s remaining` : "Finalizing...");

              const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
              const totalMB = (total / (1024 * 1024)).toFixed(1);
              setByteStats(`${loadedMB} MB / ${totalMB} MB`);
            }
          }
        }
      );

      if (!cloudRes.ok) {
        throw new Error(
          cloudRes.data?.error?.message || "Failed to upload video to Cloudinary."
        );
      }

      setUploadProgress(100);

      // Compute final secure URL immediately
      const finalUrl =
        cloudRes.data.secure_url ||
        `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${folder}/${publicId}.mp4`;

      // Step 3: Save video metadata to local database instantly
      const saveRes = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          url: finalUrl,
          publicId: cloudRes.data.public_id || `${folder}/${publicId}`,
          resourceType: cloudRes.data.resource_type || "video",
          duration: cloudRes.data.duration || null,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || "Failed to save video details.");
      }

      router.push(`/videos/${saveData.video.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-xl shadow-lg">
      <h1 className="font-serif text-3xl font-normal text-white mb-2">Upload Video</h1>
      <p className="text-neutral-400 text-xs mb-8 font-medium">
        MP4, WebM, or Ogg format — max 500MB.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg bg-neutral-950/40 border border-neutral-800/80 px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all disabled:opacity-50"
            placeholder="Video title"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={4}
            className="w-full rounded-lg bg-neutral-950/40 border border-neutral-800/80 px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all disabled:opacity-50"
            placeholder="Write a brief description of the video..."
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
            Video file
          </label>
          <input
            required
            type="file"
            disabled={loading}
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-neutral-800 file:hover:bg-neutral-700 file:text-white file:font-semibold file:cursor-pointer transition-colors disabled:opacity-50"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}

        {loading && (
          <div className="mt-2 flex flex-col gap-2.5 p-4 rounded-xl border border-neutral-800/90 bg-neutral-950/60 shadow-inner">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-neutral-300 flex items-center gap-2">
                {uploadProgress < 100 ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
                    Uploading...
                  </>
                ) : (
                  "Finalizing video..."
                )}
              </span>
              <span className="text-[#E50914] font-mono font-bold text-sm">
                {uploadProgress}%
              </span>
            </div>

            <div className="w-full bg-neutral-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-neutral-700/50">
              <div
                className="bg-gradient-to-r from-[#E50914] to-[#ff414d] h-full rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(229,9,20,0.8)]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-neutral-400 font-mono pt-0.5">
              <span>{byteStats || "Preparing..."}</span>
              <span className="text-neutral-300 font-semibold">
                {uploadSpeed && `${uploadSpeed} • ${eta}`}
              </span>
            </div>

            {uploadProgress === 100 && (
              <p className="text-[11px] text-neutral-400 text-center animate-pulse mt-0.5">
                Upload complete! Redirecting to video...
              </p>
            )}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-[#E50914] hover:bg-[#b8070f] disabled:opacity-60 text-white font-bold py-3.5 transition-all shadow-[0_4px_20px_rgba(229,9,20,0.35)] cursor-pointer mt-2"
        >
          {loading
            ? uploadProgress < 100
              ? `Uploading (${uploadProgress}%)...`
              : "Finalizing..."
            : "Upload Video"}
        </button>
      </form>
    </div>
  );
}



