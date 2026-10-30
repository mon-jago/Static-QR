// In-memory global store untuk Static QR Find Porchi dengan limit kuota 10 orang
export interface PorchiStaticState {
  token: string;
  maxQuota: number;
  scanCount: number;
  isOn: boolean;
  lastScannedAt: string | null;
  history: Array<{ index: number; timestamp: string }>;
}

// Gunakan globalThis agar state bertahan pada hot-reload development
const globalStore = globalThis as unknown as {
  __PORCHI_STATIC_STATE__?: PorchiStaticState;
};

const DEFAULT_STATE: PorchiStaticState = {
  token:
    process.env.PORCHI_STATIC_TOKEN ||
    "a2FsaW1hbnRhbnRlcmJha2Fy.dmrh70zGjs5Ev5K1TCpqtbda8yLbvgLoIetosSgh6q4",
  maxQuota: 10,
  scanCount: 0,
  isOn: true,
  lastScannedAt: null,
  history: [],
};

export function getPorchiState(): PorchiStaticState {
  if (!globalStore.__PORCHI_STATIC_STATE__) {
    globalStore.__PORCHI_STATIC_STATE__ = { ...DEFAULT_STATE };
  }
  return globalStore.__PORCHI_STATIC_STATE__;
}

export function incrementScan(): {
  success: boolean;
  scanCount: number;
  maxQuota: number;
  remainingQuota: number;
  isExhausted: boolean;
  message: string;
} {
  const state = getPorchiState();

  if (state.scanCount >= state.maxQuota) {
    return {
      success: false,
      scanCount: state.scanCount,
      maxQuota: state.maxQuota,
      remainingQuota: 0,
      isExhausted: true,
      message: "Kuota scan sudah habis (maksimal 10 orang).",
    };
  }

  state.scanCount += 1;
  const now = new Date().toISOString();
  state.lastScannedAt = now;
  state.history.push({
    index: state.scanCount,
    timestamp: now,
  });

  const remaining = Math.max(0, state.maxQuota - state.scanCount);
  const isExhausted = remaining === 0;

  return {
    success: true,
    scanCount: state.scanCount,
    maxQuota: state.maxQuota,
    remainingQuota: remaining,
    isExhausted,
    message: isExhausted
      ? "Scan berhasil! Kuota 10 orang telah tercapai sepenuhnya."
      : `Scan berhasil dicatat. Sisa kuota: ${remaining} orang.`,
  };
}

export function resetQuota(): PorchiStaticState {
  const state = getPorchiState();
  state.scanCount = 0;
  state.lastScannedAt = null;
  state.history = [];
  return state;
}

export function setPorchiToken(newToken: string): PorchiStaticState {
  const state = getPorchiState();
  if (newToken && newToken.trim().length > 0) {
    state.token = newToken.trim();
  }
  return state;
}

export function togglePorchiOn(forcedState?: boolean): PorchiStaticState {
  const state = getPorchiState();
  state.isOn = typeof forcedState === "boolean" ? forcedState : !state.isOn;
  return state;
}
