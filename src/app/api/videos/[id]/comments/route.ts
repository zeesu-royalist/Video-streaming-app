import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const rows = db
    .select({
      id: comments.id,
      text: comments.text,
      startTime: comments.startTime,
      endTime: comments.endTime,
      createdAt: comments.createdAt,
      userId: comments.userId,
      userName: users.name,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.videoId, id))
    .orderBy(asc(comments.createdAt))
    .all();

  return NextResponse.json({ comments: rows });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

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

  const { id } = await params;
  const body = await req.json();
  const { text, startTime, endTime } = body;

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  let validStartTime: number | null = null;
  let validEndTime: number | null = null;

  if (startTime !== undefined && startTime !== null && startTime !== "") {
    const numStart = Math.floor(Number(startTime));
    if (isNaN(numStart) || numStart < 0) {
      return NextResponse.json(
        { error: "Start time must be a valid non-negative number of seconds." },
        { status: 400 }
      );
    }
    validStartTime = numStart;
  }

  if (endTime !== undefined && endTime !== null && endTime !== "") {
    const numEnd = Math.floor(Number(endTime));
    if (isNaN(numEnd) || numEnd < 0) {
      return NextResponse.json(
        { error: "End time must be a valid non-negative number of seconds." },
        { status: 400 }
      );
    }
    validEndTime = numEnd;
  }

  if (validStartTime !== null || validEndTime !== null) {
    if (validStartTime === null) {
      return NextResponse.json(
        { error: "Start time is required when setting an end time." },
        { status: 400 }
      );
    }
    if (validEndTime === null) {
      // Default duration: startTime + 10 seconds if endTime not provided
      validEndTime = validStartTime + 10;
    }
    if (validEndTime <= validStartTime) {
      return NextResponse.json(
        { error: "End time must be strictly greater than start time." },
        { status: 400 }
      );
    }
  }

  const inserted = db
    .insert(comments)
    .values({
      videoId: id,
      userId: session.user.id,
      text: text.trim(),
      startTime: validStartTime,
      endTime: validEndTime,
    })
    .returning()
    .get();

  return NextResponse.json({
    comment: { ...inserted, userName: session.user.name },
  });
}
