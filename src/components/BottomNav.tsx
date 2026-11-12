"use client";

import { House, Camera, Settings } from "lucide-react";
import { useSettings } from "@/lib/settings";

export type Tab = "home" | "camera" | "settings";

export default function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { t } = useSettings();

  return (
    <nav className="glass-nav pb-safe" aria-label="Main navigation">
      <div className="nav-inner">
        <button
          className={`nav-item ${active === "home" ? "nav-active" : ""}`}
          onClick={() => onChange("home")}
          aria-current={active === "home" ? "page" : undefined}
        >
          <House size={22} strokeWidth={2.1} />
          <span>{t("home")}</span>
        </button>

        <button
          className={`nav-cam ${active === "camera" ? "nav-cam-active" : ""}`}
          onClick={() => onChange("camera")}
          aria-label={t("camera")}
        >
          <Camera size={26} strokeWidth={2.2} />
        </button>

        <button
          className={`nav-item ${active === "settings" ? "nav-active" : ""}`}
          onClick={() => onChange("settings")}
          aria-current={active === "settings" ? "page" : undefined}
        >
          <Settings size={22} strokeWidth={2.1} />
          <span>{t("settings")}</span>
        </button>
      </div>
    </nav>
  );
}
