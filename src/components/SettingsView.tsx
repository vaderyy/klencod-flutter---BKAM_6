"use client";

import type { ReactNode } from "react";
import { Sun, MoonStar, MessageCircle, ChevronRight, Type, Languages, Palette, LifeBuoy } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { WHATSAPP_URL, type FontSize, type Lang, type Theme } from "@/lib/i18n";

function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: ReactNode; demo?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={o.value}
          className={`seg-item ${value === o.value ? "seg-on" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon}
          <span style={o.demo ? { fontSize: o.demo } : undefined}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function SettingsView() {
  const { t, lang, theme, fontSize, setLang, setTheme, setFontSize } = useSettings();

  return (
    <div className="screen-scroll pt-safe">
      <header className="home-hero">
        <p className="credit-mini">{t("credit")}</p>
        <h1 className="hero-title hero-title-sm font-display">{t("settings")}</h1>
      </header>

      <div className="set-list">
        <section className="set-group fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="set-group-label">
            <Languages size={16} strokeWidth={2.2} />
            {t("language")}
          </div>
          <Seg<Lang>
            value={lang}
            onChange={setLang}
            options={[
              { value: "ar", label: t("arabic"), demo: undefined },
              { value: "en", label: t("english") },
            ]}
          />
        </section>

        <section className="set-group fade-up" style={{ animationDelay: "0.12s" }}>
          <div className="set-group-label">
            <Palette size={16} strokeWidth={2.2} />
            {t("displayMode")}
          </div>
          <Seg<Theme>
            value={theme}
            onChange={setTheme}
            options={[
              { value: "sunny", label: t("sunny"), icon: <Sun size={17} strokeWidth={2.2} /> },
              { value: "dark", label: t("darkMode"), icon: <MoonStar size={17} strokeWidth={2.2} /> },
            ]}
          />
          <div className="theme-preview" aria-hidden>
            <span className="theme-dot theme-dot-sky" />
            <span className="theme-dot theme-dot-mint" />
            <span className="theme-hint">{t("sunny")} · {t("darkMode")}</span>
          </div>
        </section>

        <section className="set-group fade-up" style={{ animationDelay: "0.19s" }}>
          <div className="set-group-label">
            <Type size={16} strokeWidth={2.2} />
            {t("fontSize")}
          </div>
          <Seg<FontSize>
            value={fontSize}
            onChange={setFontSize}
            options={[
              { value: "sm", label: t("fontSmall"), demo: "0.82em" },
              { value: "md", label: t("fontMedium"), demo: "1em" },
              { value: "lg", label: t("fontLarge"), demo: "1.18em" },
            ]}
          />
        </section>

        <section className="set-group fade-up" style={{ animationDelay: "0.26s" }}>
          <div className="set-group-label">
            <LifeBuoy size={16} strokeWidth={2.2} />
            {t("help")}
          </div>
          <a className="wa-row" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            <span className="wa-ic">
              <MessageCircle size={21} strokeWidth={2.1} />
            </span>
            <span className="wa-txt">
              <strong>{t("help")}</strong>
              <small>{t("helpSub")}</small>
            </span>
            <span className="wa-num font-display" dir="ltr">+218 93 427 4024</span>
            <ChevronRight size={18} className="m-chev rtl:-scale-x-100" />
          </a>
        </section>

        <footer className="set-foot fade-up" style={{ animationDelay: "0.33s" }}>
          <p className="credit-foot">{t("credit")}</p>
          <p className="version-foot font-display">{t("version")}</p>
        </footer>
      </div>
    </div>
  );
}
