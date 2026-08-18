import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { watchHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId } = await params;

    db.delete(watchHistory)
      .where(and(eq(watchHistory.userId, session.user.id), eq(watchHistory.videoId, videoId)))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/history/[videoId] error:", error);
    return NextResponse.json({ error: "Failed to remove item from history" }, { status: 500 });
  }
}
