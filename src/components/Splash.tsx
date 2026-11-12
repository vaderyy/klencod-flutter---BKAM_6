"use client";

import { useEffect } from "react";

export default function Splash({ credit, exiting, onDone }: { credit: string; exiting: boolean; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  // تم استبدال نص HELLO بشعار بكم الرسمي

  return (
    <div className={`splash ${exiting ? "splash-exit" : ""}`} onClick={onDone} role="presentation">
      <div className="splash-orb orb-a" />
      <div className="splash-orb orb-b" />
      <div className="splash-ring" />
      <div className="splash-core">
        <img
          src="/icons/icon-192.png"
          alt="بكم؟"
          className="splash-logo"
          style={{ width: 140, height: 140, borderRadius: 28, boxShadow: "0 10px 40px rgba(0,0,0,0.35)" }}
        />
        <div className="splash-shine" />
        <div className="splash-divider" />
        <p className="splash-credit">{credit}</p>
        <p className="splash-brand font-display">بكم؟ · com.webkam.app</p>
      </div>
    </div>
  );
}
