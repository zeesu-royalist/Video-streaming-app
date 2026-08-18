import { v2 as cloudinary } from "cloudinary";
import { getVideoThumbnailUrl } from "@/lib/format";

export { getVideoThumbnailUrl };


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  duration?: number;
}

export async function saveUploadedFile(
  file: File,
  subfolder: "videos" | "documents" | "thumbnails"
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const resourceType =
    subfolder === "videos"
      ? "video"
      : file.type.startsWith("image/") || file.type === "application/pdf"
        ? "image"
        : "raw";

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";

  // For video and image (including PDFs), Cloudinary handles format transformations automatically.
  // For raw files (DOCX, TXT, PPTX), extension in public_id preserves original format.
  const publicId =
    resourceType === "raw" && ext
      ? `${crypto.randomUUID()}.${ext}`
      : crypto.randomUUID();

  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  return new Promise<UploadResult>((resolve, reject) => {
    const options: Record<string, unknown> = {
      folder: subfolder,
      resource_type: resourceType,
      public_id: publicId,
      use_filename: false,
      unique_filename: false,
    };

    if (resourceType === "video") {
      options.format = "mp4";
    }

    const callback = (error: unknown, result: { secure_url: string; public_id: string; resource_type: string; duration?: number } | undefined) => {
      if (error || !result) {
        return reject(error || new Error("Cloudinary upload failed."));
      }
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        duration: result.duration ? Math.round(result.duration) : undefined,
      });
    };

    const uploadStream = uploadPreset
      ? cloudinary.uploader.unsigned_upload_stream(uploadPreset, options, callback)
      : cloudinary.uploader.upload_stream(options, callback);

    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: string = "raw"
): Promise<boolean> {
  if (!publicId) return false;
  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return res.result === "ok";
  } catch (err) {
    console.error("Failed to delete resource from Cloudinary:", err);
    return false;
  }
}

export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25MB

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/png",
  "image/jpeg",
];

export function getDocumentUrl(url: string): string {
  if (!url) return url;
  return url;
}
