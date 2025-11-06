
"use client";
import UserCard from "@/components/ui/UserCard";
import { useLanguage, content as i18nContent } from "../../../../context/LanguageContext";

const AdminPage = () => {
  const { language } = useLanguage();
  const tDash = i18nContent[language]?.assetDashboard || {};
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      <div className="w-full lg:w-3/2 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-[var(--brand-text)]">{tDash.heading || 'Assets Dashboard'}</h1>
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard typeKey="amountSold" />
          <UserCard typeKey="totalVolumeCompensated" />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;