import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { notes, users } from "@/db/schema";
import { eq, and, or, desc, asc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    let notesList;

    if (currentUserId) {
      // Logged in: show user's own notes (public or private) + other users' public notes
      notesList = db
        .select({
          id: notes.id,
          videoId: notes.videoId,
          userId: notes.userId,
          userName: users.name,
          content: notes.content,
          timestamp: notes.timestamp,
          isPublic: notes.isPublic,
          createdAt: notes.createdAt,
        })
        .from(notes)
        .leftJoin(users, eq(notes.userId, users.id))
        .where(
          and(
            eq(notes.videoId, videoId),
            or(eq(notes.userId, currentUserId), eq(notes.isPublic, true))
          )
        )
        .orderBy(asc(notes.timestamp), desc(notes.createdAt))
        .all();
    } else {
      // Guest: show only public notes
      notesList = db
        .select({
          id: notes.id,
          videoId: notes.videoId,
          userId: notes.userId,
          userName: users.name,
          content: notes.content,
          timestamp: notes.timestamp,
          isPublic: notes.isPublic,
          createdAt: notes.createdAt,
        })
        .from(notes)
        .leftJoin(users, eq(notes.userId, users.id))
        .where(and(eq(notes.videoId, videoId), eq(notes.isPublic, true)))
        .orderBy(asc(notes.timestamp), desc(notes.createdAt))
        .all();
    }

    return NextResponse.json(notesList);
  } catch (error) {
    console.error("GET /api/videos/[id]/notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await params;
    const body = await req.json();
    const { content, timestamp, isPublic } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Note cannot exceed 1000 characters" }, { status: 400 });
    }

    const parsedTimestamp = Math.max(0, Math.floor(Number(timestamp) || 0));

    const newNote = db
      .insert(notes)
      .values({
        videoId,
        userId: session.user.id,
        content: content.trim(),
        timestamp: parsedTimestamp,
        isPublic: Boolean(isPublic),
      })
      .returning()
      .get();

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("POST /api/videos/[id]/notes error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
