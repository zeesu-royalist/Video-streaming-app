import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  try {
    const { subfolder, fileType, fileName } = await req.json();

    const folder = subfolder === "documents" ? "documents" : "videos";

    const resourceType =
      folder === "videos"
        ? "video"
        : fileType?.startsWith("image/") || fileType === "application/pdf"
        ? "image"
        : "raw";

    const ext = fileName && fileName.includes(".") ? fileName.split(".").pop() : "";

    const publicId =
      resourceType === "raw" && ext
        ? `${crypto.randomUUID()}.${ext}`
        : crypto.randomUUID();

    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, any> = {
      timestamp,
      folder,
      public_id: publicId,
      async: "true",
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      publicId,
      resourceType,
      async: "true",
    });

  } catch (err: any) {
    console.error("Signature error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate upload signature." },
      { status: 500 }
    );
  }
}
