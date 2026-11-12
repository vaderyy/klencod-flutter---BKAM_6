"use client";

import { X, Aperture, RefreshCcw } from "lucide-react";
import { useCamera } from "@/lib/useCamera";
import { useSettings } from "@/lib/settings";
import type { ProcessedImage } from "@/lib/image";

export default function LiveCapture({
  title,
  onShot,
  onClose,
}: {
  title: string;
  onShot: (img: ProcessedImage) => void;
  onClose: () => void;
}) {
  const { t } = useSettings();
  const { videoRef, error, ready, capture } = useCamera(true);

  const shoot = async () => {
    const img = await capture();
    if (img) onShot(img);
  };

  return (
    <div className="live-capture">
      <div className="cam-top">
        <span className="cam-title">{title}</span>
        <button className="cam-close" onClick={onClose} aria-label={t("close")}>
          <X size={20} strokeWidth={2.4} />
        </button>
      </div>

      <div className="cam-stage">
        {!error && (
          <video ref={videoRef} className="cam-video" autoPlay playsInline muted />
        )}
        {error ? (
          <div className="cam-error">
            <Aperture size={40} strokeWidth={1.6} />
            <p className="cam-error-title">{t("cameraDeniedTitle")}</p>
            <p className="cam-error-sub">{t("cameraDeniedSub")}</p>
          </div>
        ) : (
          <div className="cam-frame" aria-hidden>
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
          </div>
        )}
      </div>

      {!error && <p className="cam-hint">{t("captureHint")}</p>}

      <div className="cam-actions">
        {error ? (
          <button className="btn btn-ghost" onClick={onClose}>
            <RefreshCcw size={17} strokeWidth={2.2} />
            {t("back")}
          </button>
        ) : (
          <button className="shutter" onClick={shoot} disabled={!ready} aria-label={t("captureProduct")}>
            <span className="shutter-dot" />
          </button>
        )}
      </div>
    </div>
  );
}
