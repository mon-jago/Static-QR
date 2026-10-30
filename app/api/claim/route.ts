import { NextResponse } from "next/server";
import { incrementScan, getPorchiState } from "@/lib/porchi-static-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = incrementScan();
  const state = getPorchiState();

  return NextResponse.json(
    {
      success: result.success,
      message: result.message,
      data: {
        scan_count: result.scanCount,
        max_quota: result.maxQuota,
        remaining_quota: result.remainingQuota,
        is_exhausted: result.isExhausted,
        token: state.token,
      },
    },
    { status: result.success ? 200 : 409 }
  );
}

export async function POST() {
  return GET();
}
