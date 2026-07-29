"use client";

import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import Header from "@/components/shared/Header";
import { useLanguage, content } from "../../../../../../../context/LanguageContext";
import APIKeyDetailsPanel from "@/components/settings/apiKey/APIKeyDetailsPanel";

export default function APIKeyDetails() {
  const { key } = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = content?.[language]?.apiKeyDetails || {};

  return (
  <div className="min-h-screen bg-[var(--brand-background)] text-[var(--brand-text)]">
     <Header title={t.title || 'API key'} />
    <div className="min-h-screen px-6 py-12 bg-[var(--brand-background)] font-grotesk">
       
      <div className="max-w-6xl mx-auto">
          <button onClick={() => router.push("/neuro-access/settings?tab=api")}
           className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6">
          <FaArrowLeft /> {t.back || 'Back to API Keys'}
        </button>

        <APIKeyDetailsPanel apiKey={key} />
      </div>
    </div>
      </div>

  );
}
