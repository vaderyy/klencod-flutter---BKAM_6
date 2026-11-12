"use client";

import { Languages } from "lucide-react";
import { useSettings } from "@/lib/settings";
import type { Lang } from "@/lib/i18n";

export default function LanguageGate() {
  const { t, lang, chooseLanguage } = useSettings();

  const pick = (l: Lang) => chooseLanguage(l);

  return (
    <div className="gate-backdrop">
      <div className="gate-sheet sheet-in" role="dialog" aria-modal="true">
        <div className="gate-icon">
          <Languages size={26} strokeWidth={2} />
        </div>
        <h2 className="gate-title">{t("chooseLanguage")}</h2>
        <p className="gate-sub">{t("chooseLanguageSub")}</p>

        <div className="gate-options">
          <button
            className={`gate-option ${lang === "ar" ? "gate-option-active" : ""}`}
            onClick={() => pick("ar")}
            dir="rtl"
          >
            <span className="gate-num font-display">1</span>
            <span className="gate-lang">{t("arabic")}</span>
            <span className="gate-native font-display">ع</span>
          </button>
          <button
            className={`gate-option ${lang === "en" ? "gate-option-active" : ""}`}
            onClick={() => pick("en")}
            dir="ltr"
          >
            <span className="gate-num font-display">2</span>
            <span className="gate-lang">{t("english")}</span>
            <span className="gate-native font-display">EN</span>
          </button>
        </div>
        <p className="gate-credit">{t("credit")}</p>
      </div>
    </div>
  );
}
