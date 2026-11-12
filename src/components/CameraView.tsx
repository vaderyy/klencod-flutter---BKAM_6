"use client";

import { useCallback, useRef, useState } from "react";
import { Aperture, ScanSearch, FolderOpen, RotateCcw, BadgeCheck, Sparkles } from "lucide-react";
import { useCamera } from "@/lib/useCamera";
import { useSettings } from "@/lib/settings";
import { processFile, type ProcessedImage } from "@/lib/image";
import { marketById } from "@/lib/markets";
import type { Product } from "@/lib/i18n";
import { fmtPrice, sizeLabel } from "@/components/MarketView";

type Phase = "live" | "scan" | "result";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CameraView() {
  const { t, marketName } = useSettings();
  const [phase, setPhase] = useState<Phase>("live");
  const [snap, setSnap] = useState<ProcessedImage | null>(null);
  const [found, setFound] = useState<Product | null>(null);
  const [confidence, setConfidence] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = useRef(false);

  const { videoRef, error, ready, capture } = useCamera(phase === "live");

  const identify = useCallback(
    async (img: ProcessedImage) => {
      try {
        const [res] = await Promise.all([
          fetch("/api/identify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ahash: img.ahash, dhash: img.dhash, color: img.color }),
          }).then((r) => r.json()),
          sleep(1100),
        ]);
        setFound((res.product as Product | null) ?? null);
        setConfidence(typeof res.confidence === "number" ? res.confidence : 0);
      } catch {
        setFound(null);
      } finally {
        setPhase("result");
        busy.current = false;
      }
    },
    [],
  );

  const shoot = async () => {
    if (busy.current) return;
    const img = await capture();
    if (!img) return;
    busy.current = true;
    setSnap(img);
    setFound(null);
    setPhase("scan");
    void identify(img);
  };

  const onFile = async (f: File | undefined) => {
    if (!f || busy.current) return;
    try {
      busy.current = true;
      const img = await processFile(f);
      setSnap(img);
      setFound(null);
      setPhase("scan");
      void identify(img);
    } catch {
      busy.current = false;
    }
  };

  const again = () => {
    setSnap(null);
    setFound(null);
    setPhase("live");
  };

  return (
    <div className="cam-screen pt-safe">
      <header className="cam-header">
        <p className="credit-mini">{t("credit")}</p>
        <h1 className="cam-heading">{t("captureTitle")}</h1>
        <p className="hero-sub">{t("captureHint")}</p>
      </header>

      <div className="cam-card">
        {phase === "live" && !error && <video ref={videoRef} className="cam-video" autoPlay playsInline muted />}

        {phase === "live" && error && (
          <div className="cam-error">
            <Aperture size={42} strokeWidth={1.5} />
            <p className="cam-error-title">{t("cameraDeniedTitle")}</p>
            <p className="cam-error-sub">{t("cameraDeniedSub")}</p>
            <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
              <FolderOpen size={17} strokeWidth={2.2} />
              {t("useFileInstead")}
            </button>
          </div>
        )}

        {phase !== "live" && snap && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={snap.dataUrl} alt="" className="cam-video" />
            {phase === "scan" && (
              <div className="scan-layer">
                <div className="scan-frame">
                  <span className="corner tl" />
                  <span className="corner tr" />
                  <span className="corner bl" />
                  <span className="corner br" />
                </div>
                <div className="scan-line" />
                <div className="scan-label">
                  <Sparkles size={15} strokeWidth={2.2} />
                  {t("scanning")}
                </div>
              </div>
            )}
            {phase === "result" && <div className="result-tint" />}
          </>
        )}

        {phase === "live" && !error && (
          <div className="cam-frame" aria-hidden>
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
          </div>
        )}
      </div>

      {phase === "live" && !error && (
        <div className="cam-actions">
          <button className="btn btn-ghost cam-file" onClick={() => fileRef.current?.click()} aria-label={t("useFileInstead")}>
            <FolderOpen size={19} strokeWidth={2.1} />
          </button>
          <button className="shutter" onClick={shoot} disabled={!ready} aria-label={t("captureProduct")}>
            <span className="shutter-dot" />
          </button>
          <span className="cam-file-spacer" />
        </div>
      )}

      {phase === "result" && (
        <div className="result-sheet sheet-in">
          {found ? (
            <div className="result-card">
              <div className="result-badge">
                <BadgeCheck size={15} strokeWidth={2.4} />
                {t("matchedBadge")}
              </div>
              <div className="result-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={found.image} alt={found.name} className="result-img" />
                <div className="result-info">
                  <p className="result-name">{found.name}</p>
                  <div className="result-chips">
                    <span className="chip-sm">{marketName(marketById(found.market))}</span>
                    {found.size !== "none" && <span className="chip-sm">{sizeLabel(found.size, t)}</span>}
                    {confidence > 0.5 && (
                      <span className="chip-sm chip-accent">{Math.round(confidence * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="price-hero">
                <span className="price-hero-num font-display">{fmtPrice(found.price)}</span>
                <span className="price-hero-cur">{t("currency")}</span>
              </div>
              {found.wholesalePrice != null && (
                <div className="ws-row">
                  <span>{t("wholesale")}</span>
                  <strong className="font-display">
                    {fmtPrice(found.wholesalePrice)} {t("currency")}
                  </strong>
                </div>
              )}
            </div>
          ) : (
            <div className="result-card result-miss">
              <div className="miss-icon">
                <ScanSearch size={34} strokeWidth={1.8} />
              </div>
              <p className="miss-title">{t("notAdded")}</p>
              <p className="miss-sub">{t("notAddedSub")}</p>
            </div>
          )}
          <button className="btn btn-primary btn-block" onClick={again}>
            <RotateCcw size={17} strokeWidth={2.3} />
            {t("scanAgain")}
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
