import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUsersWithCounts } from "@/lib/admin-data";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const rows = getUsersWithCounts();

  return NextResponse.json({ users: rows });
}
