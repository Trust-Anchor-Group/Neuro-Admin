import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const environment = process.env.APP_ENV || "unknown";

  console.log("APPINSIGHTS_TEST_INFO", { environment });
  console.warn("APPINSIGHTS_TEST_WARNING", { environment });
  console.error("APPINSIGHTS_TEST_ERROR", { environment });

  return NextResponse.json({
    ok: true,
    environment,
  });
}
