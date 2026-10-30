import { NextRequest, NextResponse } from "next/server";
import {
  getPorchiState,
  incrementScan,
  resetQuota,
  setPorchiToken,
  togglePorchiOn,
} from "@/lib/porchi-static-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = getPorchiState();
  const remainingQuota = Math.max(0, state.maxQuota - state.scanCount);
  const isExhausted = remainingQuota === 0;

  return NextResponse.json(
    {
      success: true,
      data: {
        token: state.token,
        type: "static",
        quest: "find-porchi",
        max_quota: state.maxQuota,
        scan_count: state.scanCount,
        remaining_quota: remainingQuota,
        is_on: state.isOn,
        is_exhausted: isExhausted,
        last_scanned_at: state.lastScannedAt,
        history: state.history,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "scan";

    if (action === "scan") {
      const result = incrementScan();
      return NextResponse.json({
        success: result.success,
        message: result.message,
        data: {
          scan_count: result.scanCount,
          max_quota: result.maxQuota,
          remaining_quota: result.remainingQuota,
          is_exhausted: result.isExhausted,
        },
      });
    }

    if (action === "reset") {
      const state = resetQuota();
      return NextResponse.json({
        success: true,
        message: "Kuota scan berhasil di-reset menjadi 0/10.",
        data: {
          scan_count: state.scanCount,
          max_quota: state.maxQuota,
          remaining_quota: state.maxQuota,
          is_exhausted: false,
        },
      });
    }

    if (action === "toggle") {
      const state = togglePorchiOn(
        typeof body.isOn === "boolean" ? body.isOn : undefined
      );
      return NextResponse.json({
        success: true,
        message: `QR status diubah menjadi: ${state.isOn ? "ON" : "OFF"}`,
        data: {
          is_on: state.isOn,
        },
      });
    }

    if (action === "set_token") {
      if (typeof body.token === "string" && body.token.trim().length > 0) {
        const state = setPorchiToken(body.token);
        return NextResponse.json({
          success: true,
          message: "Token static berhasil diperbarui.",
          data: {
            token: state.token,
          },
        });
      }
    }

    return NextResponse.json(
      { success: false, error: { message: `Action '${action}' tidak valid` } },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Terjadi kesalahan",
        },
      },
      { status: 500 }
    );
  }
}
