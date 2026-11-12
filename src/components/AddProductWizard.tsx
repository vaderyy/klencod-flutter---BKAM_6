"use client";

import { useRef, useState } from "react";
import { Camera, FolderOpen, X, ArrowLeft, ArrowRight, Loader2, BadgeCheck } from "lucide-react";
import LiveCapture from "@/components/LiveCapture";
import { useSettings } from "@/lib/settings";
import { marketById } from "@/lib/markets";
import { processFile, type ProcessedImage } from "@/lib/image";
import type { SizeOption } from "@/lib/i18n";

type Step = "source" | "details" | "price" | "wholesale";

const SIZES: SizeOption[] = ["large", "medium", "small", "none"];
const STEP_INDEX: Record<Step, number> = { source: 0, details: 1, price: 2, wholesale: 3 };

export default function AddProductWizard({
  marketId,
  onClose,
  onSaved,
}: {
  marketId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, marketName } = useSettings();
  const [step, setStep] = useState<Step>("source");
  const [liveOpen, setLiveOpen] = useState(false);
  const [img, setImg] = useState<ProcessedImage | null>(null);
  const [name, setName] = useState("");
  const [size, setSize] = useState<SizeOption>("none");
  const [price, setPrice] = useState("");
  const [wholesale, setWholesale] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const stepTitles: Record<Step, string> = {
    source: t("addSheetTitle"),
    details: t("enterNameSize"),
    price: t("enterPrice"),
    wholesale: t("wholesaleQuestion"),
  };

  const goBack = () => {
    if (step === "details") setStep("source");
    else if (step === "price") setStep("details");
    else if (step === "wholesale") setStep("price");
    else onClose();
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const processed = await processFile(f);
      setImg(processed);
      setStep("details");
    } catch {
      /* ignore unreadable files */
    }
  };

  const priceNum = Number(price);
  const priceValid = price.trim() !== "" && Number.isFinite(priceNum) && priceNum >= 0;
  const wsNum = Number(wholesale);
  const wsValid = wholesale.trim() !== "" && Number.isFinite(wsNum) && wsNum >= 0;

  const save = async (withWholesale: boolean) => {
    if (!img || saving) return;
    setSaving(true);
    try {
      const r = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market: marketId,
          name,
          size,
          price: priceNum,
          wholesalePrice: withWholesale ? wsNum : null,
          image: img.dataUrl,
          ahash: img.ahash,
          dhash: img.dhash,
          color: img.color,
        }),
      });
      if (r.ok) onSaved();
    } catch {
      /* keep wizard open on failure */
    } finally {
      setSaving(false);
    }
  };

  const market = marketById(marketId);

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="wiz sheet-in" role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        <div className="wiz-top">
          <button className="icon-btn" onClick={goBack} aria-label={t("back")}>
            <ArrowLeft className="rtl:-scale-x-100" size={19} strokeWidth={2.3} />
          </button>
          <div className="wiz-top-txt">
            <h2 className="wiz-title">{stepTitles[step]}</h2>
            <p className="wiz-market">
              {marketName(market)}
              {step === "source" && <span className="wiz-sub"> · {t("addSheetSub")}</span>}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t("close")}>
            <X size={19} strokeWidth={2.3} />
          </button>
        </div>

        <div className="wiz-dots" aria-hidden>
          {([0, 1, 2, 3] as const).map((i) => (
            <span key={i} className={`dot ${STEP_INDEX[step] >= i ? "dot-on" : ""}`} />
          ))}
        </div>

        {step === "source" && (
          <div className="wiz-body pop-in" key="source">
            <button className="source-option" onClick={() => setLiveOpen(true)}>
              <span className="source-ic">
                <Camera size={24} strokeWidth={2} />
              </span>
              <span className="source-txt">
                <strong>{t("captureProduct")}</strong>
                <small>{t("captureTitle")}</small>
              </span>
              <ArrowRight size={18} className="m-chev rtl:-scale-x-100" />
            </button>
            <button className="source-option" onClick={() => fileRef.current?.click()}>
              <span className="source-ic source-ic-alt">
                <FolderOpen size={24} strokeWidth={2} />
              </span>
              <span className="source-txt">
                <strong>{t("retrieveProduct")}</strong>
                <small>{t("useFileInstead")}</small>
              </span>
              <ArrowRight size={18} className="m-chev rtl:-scale-x-100" />
            </button>
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
        )}

        {step === "details" && img && (
          <div className="wiz-body pop-in" key="details">
            <div className="wiz-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt="" className="wiz-preview-img" />
              <button
                className="wiz-retake"
                onClick={() => {
                  setImg(null);
                  setStep("source");
                }}
              >
                {t("retake")}
              </button>
            </div>
            <label className="field">
              <span className="label">{t("productName")}</span>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("productNameHint")}
                maxLength={80}
                autoFocus
              />
            </label>
            <div className="field">
              <span className="label">{t("sizeLabel")}</span>
              <div className="chip-row">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    className={`chip ${size === s ? "chip-active" : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {t(`size_${s}`)}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="btn btn-primary btn-block"
              disabled={name.trim().length === 0}
              onClick={() => setStep("price")}
            >
              {t("next")}
              <ArrowRight size={17} strokeWidth={2.4} className="rtl:-scale-x-100" />
            </button>
          </div>
        )}

        {step === "price" && (
          <div className="wiz-body pop-in" key="price">
            <label className="field">
              <span className="label">{t("priceLabel")}</span>
              <div className="price-input-wrap">
                <input
                  className="input price-input font-display"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                />
                <span className="price-cur">{t("currency")}</span>
              </div>
            </label>
            <button className="btn btn-primary btn-block" disabled={!priceValid} onClick={() => setStep("wholesale")}>
              {t("next")}
            </button>
          </div>
        )}

        {step === "wholesale" && (
          <div className="wiz-body pop-in" key="wholesale">
            <label className="field">
              <span className="label">{t("wholesalePrice")}</span>
              <div className="price-input-wrap">
                <input
                  className="input price-input font-display"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={wholesale}
                  onChange={(e) => setWholesale(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                />
                <span className="price-cur">{t("currency")}</span>
              </div>
            </label>
            <button className="btn btn-primary btn-block" disabled={!wsValid || saving} onClick={() => save(true)}>
              {saving ? <Loader2 size={18} className="spin" /> : <BadgeCheck size={18} strokeWidth={2.2} />}
              {t("saveProduct")}
            </button>
            <button className="btn btn-ghost btn-block" disabled={saving} onClick={() => save(false)}>
              {t("withoutNothing")}
            </button>
          </div>
        )}
      </div>

      {liveOpen && (
        <LiveCapture
          title={t("captureProduct")}
          onClose={() => setLiveOpen(false)}
          onShot={(shot) => {
            setLiveOpen(false);
            setImg(shot);
            setStep("details");
          }}
        />
      )}
    </div>
  );
}
