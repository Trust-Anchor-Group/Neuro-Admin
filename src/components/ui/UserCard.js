"use client";
import { BsThreeDots } from "react-icons/bs";
import { useLanguage, content as i18nContent } from "../../../context/LanguageContext";

const UserCard = ({ typeKey }) => {
  const { language } = useLanguage();
  const tUser = i18nContent[language]?.userCard || {};
  const typeLabel = tUser.types?.[typeKey] || typeKey;
  return (
    <div className="rounded-2xl bg-[var(--brand-navbar)] shadow-lg p-6 flex-1 min-w-[200px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] bg-neuroGreen/20 text-neuroGreen px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
          {tUser.thisMonth || 'This Month'} {typeLabel}
        </span>
        <BsThreeDots className="text-[var(--brand-text-secondary)] text-xl cursor-pointer hover:text-[var(--brand-text)]" />
      </div>
      <h1 className="text-3xl font-bold text-[var(--brand-text)] mb-2">1,234</h1>
      <h2 className="text-md font-medium text-[var(--brand-text-secondary)] capitalize">{typeLabel}</h2>
    </div>
  );
};

export default UserCard;