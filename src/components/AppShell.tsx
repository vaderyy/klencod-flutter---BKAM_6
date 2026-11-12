"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useSettings } from "@/lib/settings";
import Splash from "@/components/Splash";
import LanguageGate from "@/components/LanguageGate";
import BottomNav, { type Tab } from "@/components/BottomNav";
import HomeView from "@/components/HomeView";
import MarketView from "@/components/MarketView";
import CameraView from "@/components/CameraView";
import SettingsView from "@/components/SettingsView";
import { marketById } from "@/lib/markets";

export default function AppShell() {
  const s = useSettings();
  const [splashPhase, setSplashPhase] = useState<"show" | "fade" | "gone">("show");
  const [tab, setTab] = useState<Tab>("home");
  const [marketId, setMarketId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const finishSplash = useCallback(() => {
    setSplashPhase((p) => (p === "show" ? "fade" : p));
  }, []);

  useEffect(() => {
    if (splashPhase !== "fade") return;
    const t = setTimeout(() => setSplashPhase("gone"), 620);
    return () => clearTimeout(t);
  }, [splashPhase]);

  const goTab = (next: Tab) => {
    setTab(next);
  };

  const openMarket = (id: string) => {
    setMarketId(id);
    setTab("home");
    window.scrollTo(0, 0);
  };

  return (
    <Fragment>
      <main className="screen">
        {tab === "home" &&
          (marketId ? (
            <MarketView
              market={marketById(marketId)}
              onBack={() => setMarketId(null)}
              tick={tick}
              onChanged={() => setTick((v) => v + 1)}
            />
          ) : (
            <HomeView onOpen={openMarket} tick={tick} />
          ))}
        {tab === "camera" && <CameraView />}
        {tab === "settings" && <SettingsView />}
      </main>

      <BottomNav active={tab} onChange={goTab} />

      {splashPhase !== "gone" && <Splash credit={s.t("credit")} exiting={splashPhase === "fade"} onDone={finishSplash} />}

      {splashPhase === "gone" && !s.langChosen && s.hydrated && <LanguageGate />}
    </Fragment>
  );
}
