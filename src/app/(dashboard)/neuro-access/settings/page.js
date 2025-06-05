import dynamic from "next/dynamic";

const SettingsPageClient = dynamic(() => import("./SettingsPageClient"));


export default function SettingsPage() {
  return <SettingsPageClient />;
}
