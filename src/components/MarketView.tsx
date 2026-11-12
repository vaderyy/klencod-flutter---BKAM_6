"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, Trash2, PackageOpen, Check } from "lucide-react";
import type { MarketDef } from "@/lib/markets";
import { useSettings } from "@/lib/settings";
import type { Product, SizeOption } from "@/lib/i18n";
import AddProductWizard from "@/components/AddProductWizard";

export function sizeLabel(size: SizeOption, t: (k: "size_large" | "size_medium" | "size_small" | "size_none") => string) {
  if (size === "large") return t("size_large");
  if (size === "medium") return t("size_medium");
  if (size === "small") return t("size_small");
  return t("size_none");
}

export function fmtPrice(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export default function MarketView({
  market,
  onBack,
  tick,
  onChanged,
}: {
  market: MarketDef;
  onBack: () => void;
  tick: number;
  onChanged: () => void;
}) {
  const { t, theme, marketName } = useSettings();
  const [items, setItems] = useState<Product[] | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/products?market=${market.id}`);
      const d = await r.json();
      setItems((d.products as Product[]) ?? []);
    } catch {
      setItems([]);
    }
  }, [market.id]);

  useEffect(() => {
    load();
  }, [load, tick]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const remove = async (id: number) => {
    const prev = items;
    setItems((cur) => cur?.filter((p) => p.id !== id) ?? cur);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      showToast(t("deleted"));
      onChanged();
    } catch {
      setItems(prev);
    }
  };

  const Icon = market.icon;
  const light = theme === "sunny";

  return (
    <div className="screen-scroll pt-safe">
      <header className="mk-head fade-up">
        <button className="icon-btn" onClick={onBack} aria-label={t("back")}>
          <ArrowLeft className="rtl:-scale-x-100" size={20} strokeWidth={2.3} />
        </button>
        <span
          className="mk-icon"
          style={{
            background: `linear-gradient(140deg, hsl(${market.hue} 88% ${light ? 52 : 60}% / 0.24), hsl(${market.hue + 26} 88% ${
              light ? 52 : 60
            }% / 0.1))`,
            color: `hsl(${market.hue} 84% ${light ? 40 : 68}%)`,
          }}
        >
          <Icon size={24} strokeWidth={2.1} />
        </span>
        <div className="mk-head-txt">
          <h1 className="mk-title">{marketName(market)}</h1>
          <p className="mk-count">
            {items ? `${items.length} ${t("products")}` : "…"}
          </p>
        </div>
      </header>

      {items && items.length === 0 && (
        <div className="empty fade-up" style={{ animationDelay: "0.08s" }}>
          <div className="empty-icon">
            <PackageOpen size={34} strokeWidth={1.7} />
          </div>
          <p className="empty-title">{t("emptyMarketTitle")}</p>
          <p className="empty-sub">{t("emptyMarketSub")}</p>
        </div>
      )}

      <div className="prod-grid">
        {items?.map((p, i) => (
          <article key={p.id} className="prod-card fade-up" style={{ animationDelay: `${0.06 + i * 0.05}s` }}>
            <div className="prod-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="prod-img" />
              <button className="prod-del" onClick={() => remove(p.id)} aria-label={t("deleted")}>
                <Trash2 size={14} strokeWidth={2.2} />
              </button>
            </div>
            <div className="prod-body">
              <p className="prod-name">{p.name}</p>
              <p className="prod-price font-display">
                {fmtPrice(p.price)} <small>{t("currency")}</small>
              </p>
              <div className="prod-meta">
                {p.size !== "none" && <span className="chip-sm">{sizeLabel(p.size, t)}</span>}
                {p.wholesalePrice != null && (
                  <span className="chip-sm chip-accent">
                    {t("wholesale")} · {fmtPrice(p.wholesalePrice)}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="cta-dock">
        <button className="btn btn-primary btn-block" onClick={() => setWizardOpen(true)}>
          <Plus size={20} strokeWidth={2.4} />
          {t("addProduct")}
        </button>
      </div>

      {wizardOpen && (
        <AddProductWizard
          marketId={market.id}
          onClose={() => setWizardOpen(false)}
          onSaved={() => {
            setWizardOpen(false);
            load();
            onChanged();
            showToast(t("done"));
          }}
        />
      )}

      {toast && (
        <div className="toast pop-in" role="status">
          <Check size={16} strokeWidth={2.6} />
          {toast}
        </div>
      )}
    </div>
  );
}
