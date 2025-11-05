"use client";
import { useEffect, useMemo, useState } from "react";
import { useLanguage, content } from '../../../../context/LanguageContext';
import { Square, SquareCheck } from "lucide-react";

// Fallback descriptions if translation keys are missing
const stepFallbackText = {
    FIRST: "Review ID instructions",
    MID: "Add middle name (optional in most flows)",
    LAST: "Add last name",
    PNR: "Enter national ID / personal number",
    DOB: "Confirm date of birth",
    GENDER: "Select gender",
    NATIONALITY: "Select nationality",
    ADDR: "Provide residential address",
    ZIP: "Enter postal / ZIP code",
    CITY: "Add city of residence",
    COUNTRY: "Select country",
    AREA: "Set area / neighborhood",
    REGION: "Choose state / region",
};

export default function KYCSettingsPreview({
	requiredFields = [],
	labels = {},
	loading = false,
}) {
    const { language } = useLanguage();
    const t = content[language];

    const steps = useMemo(
		() => requiredFields.filter((field) => field.required),
		[requiredFields],
	);
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (!steps.length) {
			setActiveIndex(0);
			return;
		}
		setActiveIndex((prev) => Math.min(prev, steps.length - 1));
	}, [steps]);

	const activeStep = steps[activeIndex] || null;
	const progress = steps.length
		? Math.round(((activeIndex + 1) / steps.length) * 100)
		: 0;

    return (
		<div className="w-full  flex flex-col">
            <h2 className="text-2xl font-semibold text-[var(--brand-text)] mb-6">{t?.kycPreview?.previewTitle || 'Preview'}</h2>
			<div className="flex flex-col flex-shrink-0 bg-[var(--brand-background)] border border-[var(--brand-border)] rounded-xl p-5 lg:self-stretch">
                <p className="text-sm text-[var(--brand-text-secondary)] mb-4">
                    {t?.kycPreview?.intro || 'This miniature flow mirrors the end-user onboarding. Toggle required fields to see how the checklist adapts in real time.'}
                </p>

                {loading ? (
                    <div className="flex gap-4 animate-pulse">
                        <div className="hidden lg:block w-1/2 h-64 rounded-xl bg-[var(--brand-border)]/60" />
                        <div className="w-full lg:w-1/2 h-64 rounded-xl bg-[var(--brand-border)]/60" />
                    </div>
                ) : steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-navbar)] py-12 text-center text-sm text-[var(--brand-text-secondary)]">
                        {t?.kycPreview?.empty || 'No required fields selected. Enable at least one field to view the onboarding preview.'}
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row lg:items-stretch">
                        {/* Side menu */}
                        <div className="lg:w-1/2 max-h-[535px] flex flex-col rounded-l-xl bg-[var(--brand-navbar)] border-r border-[var(--brand-border)] shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-[var(--brand-border)]">
                                <p className="text-xs uppercase tracking-[0.15em] text-[var(--brand-text-secondary)] mb-1">
                                    {t?.kycPreview?.progressLabel || 'Progress'}
                                </p>
                                <div className="flex items-center justify-between text-sm text-[var(--brand-text)] font-medium">
                                    <span>{activeIndex + 1} / {steps.length} {t?.kycPreview?.stepsSuffix || 'steps'}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-[var(--brand-background)] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-2 space-y-2">
                                {steps.map((step, idx) => {
                                    const label = labels?.[step.id] || step.label;
                                    const isActive = idx === activeIndex;
                                    return (
                                        <button
                                            type="button"
                                            key={step.id}
                                            onClick={() => setActiveIndex(idx)}
                                            className={`w-full flex items-center justify-between rounded-lg px-4 py-3 text-[var(--brand-text)] text-sm font-semibold transition-colors ${
                                                isActive
                                                    ? "bg-[var(--brand-primary)] text-white"
                                                    : "bg-[var(--brand-background)] text-[var(--brand-text)] border border-[var(--brand-border)] hover:bg-white/10"
                                            }`}
                                        >
                                            <span className="truncate">{label}</span>
                                            <span className="ml-4 flex-none">
                                                {isActive ? (
                                                    <SquareCheck className="h-5 w-5 text-white" />
                                                ) : (
                                                    <Square className="h-5 w-5 text-[var(--brand-primary)]" />
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Step details */}
                        <div className="flex-1 flex flex-col h-[535px] rounded-r-xl border-l border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-secondary)] mb-2">
                                    {(t?.kycPreview?.stepLabel || 'Step')} {activeIndex + 1}
                                </p>
                                <h3 className="text-lg font-semibold text-[var(--brand-text)] mb-1">
                                    {activeStep ? labels?.[activeStep.id] || activeStep.label : (t?.kycPreview?.nextField || 'Next field')}
                                </h3>
                                <p className="text-sm text-[var(--brand-text-secondary)] leading-relaxed">
                                    {activeStep
                                        ? (t?.kycPreview?.stepDescriptions?.[activeStep.id] || stepFallbackText[activeStep.id] || 'Collect this detail from the applicant to keep the onboarding flow moving.')
                                        : (t?.kycPreview?.selectStep || 'Select a step from the checklist to inspect the preview.')}
                                </p>
                            </div>
                            <input
                                type="text"
                                className="mt-2 p-2 border border-[var(--brand-border)] rounded-md bg-[var(--brand-background)]"
                                placeholder={`${t?.kycPreview?.placeholderPrefix || 'Enter'} ${activeStep?.label || ''}`}
                                disabled={true}
                            />

                        </div>
                    </div>
                )}
			</div>
		</div>
	);
}
