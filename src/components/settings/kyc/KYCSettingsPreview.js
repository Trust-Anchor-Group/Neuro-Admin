"use client";

import { useEffect, useMemo, useState } from "react";
import { getKycPreviewSteps } from "../../../lib/kycXml";
import { Square, SquareCheck } from "lucide-react";

const placeholderByType = { date: "YYYY-MM-DD", country: "Select country", radio: "", checkbox: "", text: "Enter your answer" };

export default function KYCSettingsPreview({ requiredFields = [], customFields = [], labels = {}, loading = false }) {
  const steps = useMemo(() => getKycPreviewSteps(requiredFields, customFields, labels), [requiredFields, customFields, labels]);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => { setActiveIndex((current) => Math.min(current, Math.max(steps.length - 1, 0))); }, [steps.length]);
  const activeStep = steps[activeIndex] || null;
  const progress = steps.length ? Math.round(((activeIndex + 1) / steps.length) * 100) : 0;
  const isLastStep = activeIndex === steps.length - 1;

  return <div className="flex w-full flex-col">
    <h2 className="mb-6 text-[28px] font-semibold text-[var(--brand-text)]">Preview</h2>
    <div className="flex flex-col rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-5 lg:self-stretch">
      <p className="mb-4 text-base text-[var(--brand-text-secondary)]">This preview mirrors the applicant's step-by-step verification flow.</p>
      {loading ? <div className="flex gap-4 animate-pulse"><div className="hidden h-64 w-1/2 rounded-xl bg-[var(--brand-border)]/60 lg:block" /><div className="h-64 w-full rounded-xl bg-[var(--brand-border)]/60 lg:w-1/2" /></div>
        : !steps.length ? <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-navbar)] px-6 text-center text-sm text-[var(--brand-text-secondary)]">No required or saved custom fields have been configured yet.</div>
        : <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="flex max-h-[535px] flex-col overflow-hidden rounded-t-xl border-b border-[var(--brand-border)] bg-[var(--brand-navbar)] shadow-sm lg:w-1/2 lg:rounded-l-xl lg:rounded-tr-none lg:border-b-0 lg:border-r">
            <div className="border-b border-[var(--brand-border)] p-4"><p className="mb-1 text-xs uppercase tracking-[0.15em] text-[var(--brand-text-secondary)]">Progress</p><div className="flex items-center justify-between text-base font-medium text-[var(--brand-text)]"><span>{activeIndex + 1} / {steps.length} steps</span><span>{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-background)]"><div className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300 ease-out" style={{ width: `${progress}%` }} /></div></div>
            <nav className="flex-1 space-y-2 overflow-y-auto p-2" aria-label="KYC preview steps">{steps.map((step, index) => { const isActive = index === activeIndex; return <button type="button" key={step.id || step.key} onClick={() => setActiveIndex(index)} className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-semibold transition-colors ${isActive ? "bg-[var(--brand-primary)] text-white" : "border border-[var(--brand-border)] bg-[var(--brand-background)] text-[var(--brand-text)] hover:bg-white/10"}`}><span className="truncate">{step.label}</span><span className="ml-4 flex-none">{isActive ? <SquareCheck className="h-5 w-5 text-white" /> : <Square className="h-5 w-5 text-[var(--brand-primary)]" />}</span></button>; })}</nav>
          </div>
          <div className="flex h-[535px] flex-1 flex-col rounded-b-xl bg-[var(--brand-navbar)] p-5 shadow-sm lg:rounded-l-none lg:rounded-r-xl"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-secondary)]">Step {activeIndex + 1}</p><h3 className="mb-1 text-xl font-semibold text-[var(--brand-text)]">{activeStep?.label || "Next field"}</h3><p className="leading-relaxed text-[var(--brand-text-secondary)]">{activeStep?.description || "Select a step to inspect the field."}</p></div><PreviewInput field={activeStep} /><div className="mt-auto flex items-center justify-between gap-3 pt-5"><button type="button" onClick={() => setActiveIndex((current) => Math.max(current - 1, 0))} disabled={activeIndex === 0} className="h-10 rounded-md border border-[var(--brand-border)] px-4 text-sm font-semibold text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-40">Back</button><button type="button" onClick={() => !isLastStep && setActiveIndex((current) => current + 1)} className="h-10 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-5 text-sm font-semibold text-white disabled:cursor-default">{isLastStep ? "Finish" : "Next"}</button></div></div>
        </div>}
    </div>
  </div>;
}

function PreviewInput({ field }) {
  if (!field) return null;
  const options = field.options?.length ? field.options : [{ id: "preview-option", value: "Option" }];
  if (field.type === "radio" || field.type === "checkbox") { const inputType = field.type === "radio" ? "radio" : "checkbox"; return <div className="mt-6 space-y-3" aria-label={`${field.label} options`}>{options.map((option) => <label key={option.id} className="flex items-center gap-3 rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-3 text-[var(--brand-text-secondary)]"><input type={inputType} name={`preview-${field.id || field.key}`} disabled className="h-4 w-4 accent-[var(--brand-primary)]" /><span>{option.value || "Option"}</span></label>)}</div>; }
  if (field.type === "country") return <select disabled value="" className="mt-6 h-11 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 text-[var(--brand-text-secondary)]"><option value="">{field.placeholder || placeholderByType.country}</option></select>;
  return <input type={field.type === "date" ? "date" : "text"} disabled placeholder={field.placeholder || placeholderByType[field.type] || placeholderByType.text} className="mt-6 h-11 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)]" />;
}
