"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage, content as i18nContent } from "../../../../../context/LanguageContext";
import { useRouter } from "next/navigation";

const assetTemplates = [
  {
    id: "agriculture",
    subtitle: "Subtitle",
    title: "Agriculture",
    description:
      "Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu massa dolor ac pharetra egestas nibh. Sem massa enim tortor dui eu eu maecenas.",
    templateOptions: ["Token template specification"],
  },
  {
    id: "minerals",
    subtitle: "Subtitle",
    title: "Minerals",
    description:
      "Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu massa dolor ac pharetra egestas nibh. Sem massa enim tortor dui eu eu maecenas.",
    templateOptions: ["Token template specification"],
  },
  {
    id: "Climate compensation",
    subtitle: "Subtitle",
    title: "Climate compensation",
    description:
      "Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu massa dolor ac pharetra egestas nibh. Sem massa enim tortor dui eu eu maecenas.",
    templateOptions: ["Token template specification"],
  },
];

export default function AssetTypePage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--brand-background)] p-6">
        <div className="flex flex-col gap-2 rounded-2xl bg-[var(--brand-navbar)] p-6 mb-6 shadow-md">
            <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Step 1</p>
            <h1 className="text-2xl font-semibold text-[var(--brand-text)]">
                Choose a asset type
            </h1>
            <p className="max-w-3xl text-sm text-[var(--brand-text-secondary)]">
            Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu
            massa dolor ac pharetra egestas nibh. Sem massa enim tortor du eu eu maecenas. Diam amet
            aliquam in elit proin rhoncus nunc nam sed. Pretium iaculis nibh rutrum mauris aliquet.
            Integer bibendum phasellus diam et adipiscing.
            </p>
      </div>
      <div className="space-y-6">
        {assetTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            ctaLabel={t.actions?.useTemplate}
            onUseTemplate={() =>
              router.push(`/neuro-assets/assetSetUp?template=${encodeURIComponent(template.id)}`)
            }
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ template, ctaLabel, onUseTemplate }) {
  return (
    <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
        <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">{template.subtitle}</p>
        <h2 className="mt-1 text-2xl font-semibold text-[var(--brand-text)]">{template.title}</h2>

        <div className="mt-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
            <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Description</p>
            <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">{template.description}</p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-1/2">
            <div className="mt-2 flex items-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2">
                <select className="w-full appearance-none bg-transparent text-sm font-semibold text-[var(--brand-text)] outline-none">
                {template.templateOptions.map((option) => (
                    <option key={option}>{option}</option>
                ))}
                </select>
                <ChevronDown className="ml-2 h-4 w-4 text-[var(--brand-text-secondary)]" />
            </div>
            </div>
            <button
            type="button"
            className="inline-flex items-center justify-center self-end rounded-lg bg-[#8F40D4] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            onClick={onUseTemplate}
            >
            {ctaLabel || "Use this template"}
            <ArrowRight className="ml-2 h-4 w-4" />
            </button>
        </div>
    </div>
  );
}
