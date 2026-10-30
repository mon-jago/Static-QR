"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const DEFAULT_TOKEN =
  process.env.NEXT_PUBLIC_PORCHI_STATIC_TOKEN ||
  "a2FsaW1hbnRhbnRlcmJha2Fy.dmrh70zGjs5Ev5K1TCpqtbda8yLbvgLoIetosSgh6q4";

export default function Home() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadQr() {
      let tokenToUse = DEFAULT_TOKEN;

      try {
        const res = await fetch("/api/display/porchi/qr-token", {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.token) {
            tokenToUse = json.data.token;
          }
        }
      } catch {
        // Gunakan DEFAULT_TOKEN jika API lokal offline
      }

      if (!isMounted) return;

      try {
        // Background transparan (#00000000) dan margin 0 untuk menghilangkan semua kotak/border putih pada QR
        const url = await QRCode.toDataURL(tokenToUse, {
          width: 600,
          margin: 0,
          color: {
            dark: "#061938",
            light: "#00000000",
          },
        });
        if (isMounted) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error("Gagal generate QR Code:", err);
      }
    }

    loadQr();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="h-dvh w-full flex items-center justify-center bg-[#061938] p-0 m-0 overflow-hidden select-none">
      {/* Container utama dengan rasio 1080 : 1920 (standee portrait) tanpa padding atau border putih */}
      <div className="relative h-full max-h-dvh aspect-[1080/1920] flex items-center justify-center bg-transparent overflow-hidden">
        {/* Gambar Background Resmi Find Porchi Standee */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/porchi-bg.png"
          alt="Find Porchi Standee Background"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
        />

        {/* Kotak QR Code transparan langsung di atas papan Porchi (tanpa padding/border putih) */}
        {/* Koordinat presisi berdasarkan 1080x1920: top 46.2%, left 18.5%, width 63%, height 35.4% */}
        <div
          className="absolute z-10 flex items-center justify-center p-0 m-0 overflow-hidden"
          style={{
            top: "46.2%",
            left: "18.5%",
            width: "63%",
            height: "35.4%",
          }}
        >
          {qrDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrDataUrl}
              alt="Static QR Find Porchi"
              className="w-full h-full object-contain animate-in fade-in duration-200"
            />
          ) : (
            <div className="size-8 sm:size-12 border-4 border-[#061938] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>
    </main>
  );
}
