"use client";
import { BsThreeDots } from "react-icons/bs";
import { useLanguage, content as i18nContent } from "../../../context/LanguageContext";

const UserCard = ({ typeKey, value }) => {
  const { language } = useLanguage();
  const tUser = i18nContent[language]?.userCard || {};

  // Define relevant labels for your project
  const labelMap = {
    tokenizedValue: "Tokenized Value",      // Was 'amountSold'
    totalTransactions: "Total Transactions" // Was 'totalVolumeCompensated'
  };

  const typeLabel = labelMap[typeKey] || typeKey;

  // Helper to determine subtitle based on type
  const subtitleMap = {
    tokenizedValue: "Total BRL Value",
    totalTransactions: "All time events"
  };

  return (
    <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] shadow-sm p-6 flex-1 min-w-[200px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] bg-neuroGreen/20 text-neuroGreen px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
          {subtitleMap[typeKey] || 'Total'}
        </span>
        <BsThreeDots className="text-[var(--brand-text-secondary)] text-xl cursor-pointer hover:text-[var(--brand-text)]" />
      </div>

      {/* Display real value passed from parent, or loading state */}
      <h1 className="text-3xl font-bold text-[var(--brand-text)] mb-2">
        {value !== undefined && value !== null ? value : "..."}
      </h1>

      <h2 className="text-md font-medium text-[var(--brand-text-secondary)] capitalize">
        {typeLabel}
      </h2>
    </div>
  );
};

export default UserCard;