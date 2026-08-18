"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function uploadToCloudinary(
    url: string,
    formData: FormData,
    onProgress: (percent: number) => void
  ): Promise<{ ok: boolean; status: number; data: any }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
          onProgress(percent);
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
            data: { error: "Failed to parse response from Cloudinary." },
          });
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error while uploading document to Cloudinary."));
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
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Step 1: Request signed upload token from backend
      const sigRes = await fetch("/api/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subfolder: "documents",
          fileType: file.type,
          fileName: file.name,
        }),
      });

      const sigData = await sigRes.json();
      if (!sigRes.ok) {
        throw new Error(sigData.error || "Failed to initialize upload session.");
      }

      const { timestamp, signature, apiKey, cloudName, folder, publicId, resourceType } = sigData;

      // Step 2: Upload file directly from browser to Cloudinary
      const cloudFormData = new FormData();
      cloudFormData.append("file", file);
      cloudFormData.append("api_key", apiKey);
      cloudFormData.append("timestamp", timestamp.toString());
      cloudFormData.append("signature", signature);
      cloudFormData.append("folder", folder);
      cloudFormData.append("public_id", publicId);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const cloudRes = await uploadToCloudinary(cloudinaryUrl, cloudFormData, (percent) => {
        setUploadProgress(percent);
      });

      if (!cloudRes.ok) {
        throw new Error(cloudRes.data?.error?.message || "Failed to upload file to Cloudinary.");
      }

      setUploadProgress(100);

      // Step 3: Save document metadata to local database
      const saveRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          visibility,
          url: cloudRes.data.secure_url,
          publicId: cloudRes.data.public_id,
          resourceType: cloudRes.data.resource_type,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || "Failed to save document details.");
      }

      router.push("/documents");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/25 backdrop-blur-xl shadow-lg">
      <h1 className="font-serif text-3xl font-normal text-white mb-2">Upload Document</h1>
      <p className="text-neutral-400 text-xs mb-8 font-medium">
        PDF, Word, PPT, images — max 25MB.
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
            placeholder="Document title"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 block">
            Visibility
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => setVisibility("PRIVATE")}
              className={`flex-1 rounded-xl border px-4 py-3 text-xs font-semibold tracking-wide transition-all cursor-pointer disabled:opacity-50 ${
                visibility === "PRIVATE"
                  ? "border-[#E50914] bg-[#E50914]/10 text-white"
                  : "border-neutral-800/85 bg-neutral-950/20 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              🔒 Private
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setVisibility("PUBLIC")}
              className={`flex-1 rounded-xl border px-4 py-3 text-xs font-semibold tracking-wide transition-all cursor-pointer disabled:opacity-50 ${
                visibility === "PUBLIC"
                  ? "border-[#E50914] bg-[#E50914]/10 text-white"
                  : "border-neutral-800/85 bg-neutral-950/20 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              🌐 Public
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">File</label>
          <input
            required
            type="file"
            disabled={loading}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/png,image/jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-neutral-800 file:hover:bg-neutral-700 file:text-white file:font-semibold file:cursor-pointer transition-colors disabled:opacity-50"
          />
        </div>

        {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}

        {loading && (
          <div className="mt-2 flex flex-col gap-2 p-4 rounded-xl border border-neutral-800/90 bg-neutral-950/60">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-neutral-300">
                {uploadProgress < 100
                  ? "Uploading to Cloudinary..."
                  : "Finalizing and saving document..."}
              </span>
              <span className="text-[#E50914] font-mono font-bold text-sm">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-neutral-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-neutral-700/50">
              <div
                className="bg-gradient-to-r from-[#E50914] to-[#ff414d] h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(229,9,20,0.8)]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            {uploadProgress === 100 && (
              <p className="text-[11px] text-neutral-400 text-center animate-pulse mt-1">
                Upload complete! Saving document...
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
            : "Upload Document"}
        </button>
      </form>
    </div>
  );
}


