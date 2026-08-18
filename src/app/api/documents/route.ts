import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { documents, users } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { saveUploadedFile, MAX_DOC_SIZE, ALLOWED_DOC_TYPES } from "@/lib/upload";

export const runtime = "nodejs";

// GET /api/documents -> public docs + (if logged in) own private docs
export async function GET() {
  const session = await auth();

  const rows = session?.user
    ? db
        .select({
          id: documents.id,
          title: documents.title,
          filePath: documents.filePath,
          visibility: documents.visibility,
          createdAt: documents.createdAt,
          uploaderId: documents.uploaderId,
          uploaderName: users.name,
        })
        .from(documents)
        .leftJoin(users, eq(documents.uploaderId, users.id))
        .where(
          or(
            eq(documents.visibility, "PUBLIC"),
            eq(documents.uploaderId, session.user.id)
          )
        )
        .orderBy(desc(documents.createdAt))
        .all()
    : db
        .select({
          id: documents.id,
          title: documents.title,
          filePath: documents.filePath,
          visibility: documents.visibility,
          createdAt: documents.createdAt,
          uploaderId: documents.uploaderId,
          uploaderName: users.name,
        })
        .from(documents)
        .leftJoin(users, eq(documents.uploaderId, users.id))
        .where(eq(documents.visibility, "PUBLIC"))
        .orderBy(desc(documents.createdAt))
        .all();

  return NextResponse.json({ documents: rows });
}

// POST /api/documents -> upload a document or save direct Cloudinary metadata
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  // Verify that the logged-in user actually exists in the database
  const userExists = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, session.user.id))
    .get();

  if (!userExists) {
    return NextResponse.json(
      {
        error:
          "User session expired or account not found. Please log out and sign in again.",
      },
      { status: 401 }
    );
  }

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    const title = body.title?.trim();
    const visibility = body.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE";
    const url = body.url;
    const publicId = body.publicId;
    const resourceType = body.resourceType || "raw";

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and document file URL are required." },
        { status: 400 }
      );
    }

    const inserted = db
      .insert(documents)
      .values({
        title,
        filePath: url,
        publicId: publicId || null,
        resourceType,
        visibility,
        uploaderId: session.user.id,
      })
      .returning()
      .get();

    return NextResponse.json({ document: inserted });
  }

  const formData = await req.formData();
  const title = (formData.get("title") as string | null)?.trim();
  const visibility = formData.get("visibility") as string | null;
  const file = formData.get("file") as File | null;

  if (!title || !file) {
    return NextResponse.json(
      { error: "Both title and file are required." },
      { status: 400 }
    );
  }

  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "This file type is not supported." },
      { status: 400 }
    );
  }

  if (file.size > MAX_DOC_SIZE) {
    return NextResponse.json(
      { error: "File size cannot exceed 25MB." },
      { status: 400 }
    );
  }

  try {
    const uploadResult = await saveUploadedFile(file, "documents");

    const inserted = db
      .insert(documents)
      .values({
        title,
        filePath: uploadResult.url,
        publicId: uploadResult.publicId,
        resourceType: uploadResult.resourceType,
        visibility: visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
        uploaderId: session.user.id,
      })
      .returning()
      .get();

    return NextResponse.json({ document: inserted });
  } catch (err: unknown) {
    console.error("Document upload error:", err);
    const message = err instanceof Error ? err.message : "Failed to upload document.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

