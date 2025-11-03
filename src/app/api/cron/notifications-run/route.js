import { NextResponse } from "next/server";
import { runNotifications } from "@/lib/notifications/runner";

export const dynamic = "force-dynamic"; // ensure server execution each call

export async function POST(req) {
  const secretHeader = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secretHeader !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // temporary: runner returns stub stats until we wire real logic
  const stats = await runNotifications();
  return NextResponse.json({ ok: true, stats }, { status: 200 });
}
