"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { MARKETS } from "@/lib/markets";
import { useSettings } from "@/lib/settings";

export default function HomeView({ onOpen, tick }: { onOpen: (id: string) => void; tick: number }) {
  const { t, theme, marketName } = useSettings();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const light = theme === "sunny";

  useEffect(() => {
    let on = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (on) setCounts((d.counts as Record<string, number>) ?? {});
      })
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [tick]);

  return (
    <div className="screen-scroll pt-safe">
      <header className="home-hero">
        <p className="credit-mini">{t("credit")}</p>
        <h1 className="hero-title font-display">
          {t("appName")}
        </h1>
        <p className="hero-sub">{t("tagline")}</p>
      </header>

      <div className="section-label">
        <span className="label-main">{t("markets")}</span>
        <span className="label-count">
          {MARKETS.length} {t("marketsCount")}
        </span>
      </div>

      <div className="market-list">
        {MARKETS.map((m, i) => {
          const Icon = m.icon;
          const c = counts[m.id] ?? 0;
          return (
            <button
              key={m.id}
              className="market-row fade-up"
              style={{ animationDelay: `${0.05 + i * 0.045}s` }}
              onClick={() => onOpen(m.id)}
            >
              <span className="m-num font-display">{String(i + 1).padStart(2, "0")}</span>
              <span
                className="m-icon"
                style={{
                  background: `linear-gradient(140deg, hsl(${m.hue} 88% ${light ? 52 : 60}% / 0.22), hsl(${m.hue + 26} 88% ${
                    light ? 52 : 60
                  }% / 0.08))`,
                  color: `hsl(${m.hue} 84% ${light ? 40 : 68}%)`,
                }}
              >
                <Icon size={22} strokeWidth={2.1} />
              </span>
              <span className="m-name">{marketName(m)}</span>
              {c > 0 && <span className="m-count font-display">{c}</span>}
              <ChevronRight className="m-chev rtl:-scale-x-100" size={18} strokeWidth={2.2} />
            </button>
          );
        })}
      </div>
      <p className="home-foot">{t("credit")}</p>
    </div>
  );
}
