import { SettingsProvider } from "@/lib/settings";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SettingsProvider>
      <div className="stage">
        <div className="phone">
          <AppShell />
        </div>
      </div>
    </SettingsProvider>
  );
}
