"use client";
import { useEffect, useMemo, useState } from "react";
import { useLanguage, content } from '../../../../context/LanguageContext';
import { ArrowLeft, ArrowRight, Check, Download, Square, SquareCheck } from "lucide-react";
import { buildKycProcessXml } from '../../../lib/kycXml';

const stepFallbackText = {
    FIRST: "Enter the name shown on your identity document.",
    MID: "Add your middle name, if applicable.",
    LAST: "Enter your family name as shown on your identity document.",
    PNR: "Enter your national ID or personal number.",
    DOB: "Choose your date of birth.",
    GENDER: "Select the option that applies to you.",
    NATIONALITY: "Select your nationality.",
    ADDR: "Enter your residential address.",
    ZIP: "Enter your postal or ZIP code.",
    CITY: "Enter your city of residence.",
    COUNTRY: "Select your country of residence.",
    AREA: "Enter your area or neighbourhood.",
    REGION: "Enter your state or region.",
};

const STANDARD_FIELD_TYPES = {
    DOB: "date",
    GENDER: "radio",
    NATIONALITY: "country",
    COUNTRY: "country",
};

const COUNTRY_OPTIONS = ["Sweden", "Norway", "Denmark", "Finland", "France", "Portugal", "Spain", "Other"];

function getFieldType(field) {
    return field.type || STANDARD_FIELD_TYPES[field.id] || "text";
}

function getFieldOptions(field) {
    if (field.id === "GENDER") return ["Male", "Female", "Prefer not to say"];
    return (field.options || []).map((option) => option.value).filter(Boolean);
}

function hasValue(value, type) {
    return type === "checkboxes" ? Array.isArray(value) && value.length > 0 : Boolean(value);
}

export default function KYCSettingsPreview({
	requiredFields = [],
	labels = {},
	loading = false,
}) {
    const { language } = useLanguage();
    const t = content[language];
    const steps = useMemo(() => requiredFields.filter((field) => field.required), [requiredFields]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [values, setValues] = useState({});
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!steps.length) {
            setActiveIndex(0);
            setIsComplete(false);
            return;
        }
        setActiveIndex((previous) => Math.min(previous, steps.length - 1));
    }, [steps]);

    const activeStep = steps[activeIndex] || null;
    const activeType = activeStep ? getFieldType(activeStep) : "text";
    const activeOptions = activeStep ? getFieldOptions(activeStep) : [];
    const activeValue = activeStep ? values[activeStep.id] : "";
    const activeIsComplete = hasValue(activeValue, activeType);
    const progress = steps.length ? Math.round(((activeIndex + 1) / steps.length) * 100) : 0;
    const completedSteps = steps.filter((step) => hasValue(values[step.id], getFieldType(step))).length;

    const labelFor = (field) => labels?.[field.id] || field.label || field.id;
    const updateValue = (fieldId, value) => {
        setValues((previous) => ({ ...previous, [fieldId]: value }));
        setIsComplete(false);
    };
    const toggleCheckbox = (option) => {
        const selected = Array.isArray(activeValue) ? activeValue : [];
        updateValue(activeStep.id, selected.includes(option)
            ? selected.filter((value) => value !== option)
            : [...selected, option]);
    };
    const goToStep = (index) => {
        setActiveIndex(index);
        setIsComplete(false);
    };
    const nextStep = () => {
        if (!activeIsComplete) return;
        if (activeIndex === steps.length - 1) {
            setIsComplete(true);
            return;
        }
        setActiveIndex((previous) => previous + 1);
    };

    const downloadXml = () => {
        const xml = buildKycProcessXml(requiredFields);
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'KYCProcess.xml';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const renderInput = () => {
        if (!activeStep) return null;

        if (activeType === "radio") {
            return activeOptions.length ? (
                <div className="mt-6 space-y-3" role="radiogroup" aria-label={labelFor(activeStep)}>
                    {activeOptions.map((option) => (
                        <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-[var(--brand-text)] transition-colors hover:border-[var(--brand-primary)]">
                            <input type="radio" name={activeStep.id} value={option} checked={activeValue === option} onChange={() => updateValue(activeStep.id, option)} className="h-5 w-5 accent-[var(--brand-primary)]" />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            ) : <EmptyOptions />;
        }

        if (activeType === "checkboxes") {
            return activeOptions.length ? (
                <div className="mt-6 space-y-3" aria-label={labelFor(activeStep)}>
                    {activeOptions.map((option) => {
                        const checked = Array.isArray(activeValue) && activeValue.includes(option);
                        return (
                            <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-[var(--brand-text)] transition-colors hover:border-[var(--brand-primary)]">
                                <input type="checkbox" checked={checked} onChange={() => toggleCheckbox(option)} className="h-5 w-5 rounded accent-[var(--brand-primary)]" />
                                <span>{option}</span>
                            </label>
                        );
                    })}
                </div>
            ) : <EmptyOptions />;
        }

        if (activeType === "country") {
            return (
                <select value={activeValue || ""} onChange={(event) => updateValue(activeStep.id, event.target.value)} className="mt-6 h-12 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 text-[var(--brand-text)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20">
                    <option value="">Select an option</option>
                    {COUNTRY_OPTIONS.map((country) => <option key={country} value={country}>{country}</option>)}
                </select>
            );
        }

        return (
            <input
                type={activeType === "date" ? "date" : "text"}
                value={activeValue || ""}
                onChange={(event) => updateValue(activeStep.id, event.target.value)}
                placeholder={activeStep.placeholder || `${t?.kycPreview?.placeholderPrefix || "Enter"} ${labelFor(activeStep)}`}
                inputMode={activeStep.id === "PNR" || activeStep.id === "ZIP" ? "numeric" : undefined}
                className="mt-6 h-12 w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 text-[var(--brand-text)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
            />
        );
    };

    return (
		<div className="w-full flex flex-col">
            <h2 className="mb-6 text-[28px] font-semibold text-[var(--brand-text)]">{t?.kycPreview?.previewTitle || 'Preview (Beta)'}</h2>
            <div className="flex flex-col flex-shrink-0 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-5 lg:self-stretch">
                <p className="mb-4 text-base text-[var(--brand-text-secondary)]">
                    {t?.kycPreview?.intro || 'This interactive preview mirrors the end-user onboarding flow. Fill in the fields to test its behaviour.'}
                </p>

                {loading ? (
                    <div className="flex gap-4 animate-pulse"><div className="hidden h-64 w-1/2 rounded-xl bg-[var(--brand-border)]/60 lg:block" /><div className="h-64 w-full rounded-xl bg-[var(--brand-border)]/60 lg:w-1/2" /></div>
                ) : steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-navbar)] py-12 text-center text-sm text-[var(--brand-text-secondary)]">{t?.kycPreview?.empty || 'No required fields selected. Enable at least one field to view the onboarding preview.'}</div>
                ) : (
                    <div className="flex flex-col lg:flex-row lg:items-stretch">
                        <div className="flex max-h-[535px] flex-col overflow-hidden rounded-l-xl border-r border-[var(--brand-border)] bg-[var(--brand-navbar)] shadow-sm lg:w-1/2">
                            <div className="border-b border-[var(--brand-border)] p-4">
                                <p className="mb-1 text-xs uppercase tracking-[0.15em] text-[var(--brand-text-secondary)]">{t?.kycPreview?.progressLabel || 'Progress'}</p>
                                <div className="flex items-center justify-between text-base font-medium text-[var(--brand-text)]"><span>{activeIndex + 1} / {steps.length} {t?.kycPreview?.stepsSuffix || 'steps'}</span><span>{completedSteps} completed</span></div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--brand-background)]"><div className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300 ease-out" style={{ width: `${progress}%` }} /></div>
                            </div>
                            <nav className="flex-1 space-y-2 overflow-y-auto p-2">
                                {steps.map((step, index) => {
                                    const isActive = index === activeIndex;
                                    const isFilled = hasValue(values[step.id], getFieldType(step));
                                    return <button type="button" key={step.id} onClick={() => goToStep(index)} className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-semibold transition-colors ${isActive ? 'bg-[var(--brand-primary)] text-white' : 'border border-[var(--brand-border)] bg-[var(--brand-background)] text-[var(--brand-text)] hover:bg-white/10'}`}><span className="truncate">{labelFor(step)}</span><span className="ml-4 flex-none">{isFilled ? <SquareCheck className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[var(--brand-primary)]'}`} /> : <Square className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[var(--brand-primary)]'}`} />}</span></button>;
                                })}
                            </nav>
                        </div>

                        <div className="flex h-[535px] flex-1 flex-col rounded-r-xl border-l border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm">
                            {isComplete ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]"><Check className="h-8 w-8" /></div>
                                    <h3 className="text-xl font-semibold text-[var(--brand-text)]">Preview complete</h3>
                                    <p className="mt-2 text-base text-[var(--brand-text-secondary)]">All required fields have been completed in this preview.</p>
                                    <button type="button" onClick={() => goToStep(0)} className="mt-6 rounded-md border border-[var(--brand-border)] px-4 py-2 font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-background)]">Review answers</button>
                                </div>
                            ) : <>
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-secondary)]">{t?.kycPreview?.stepLabel || 'Step'} {activeIndex + 1}</p>
                                    <h3 className="mb-1 text-xl font-semibold text-[var(--brand-text)]">{labelFor(activeStep)}</h3>
                                    <p className="text-base leading-relaxed text-[var(--brand-text-secondary)]">{t?.kycPreview?.stepDescriptions?.[activeStep.id] || stepFallbackText[activeStep.id] || 'Provide the requested information to continue.'}</p>
                                </div>
                                {renderInput()}
                                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--brand-border)] pt-5">
                                    <button type="button" onClick={() => goToStep(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0} className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--brand-border)] px-4 text-sm font-medium text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" />Back</button>
                                    <button type="button" onClick={nextStep} disabled={!activeIsComplete} className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{activeIndex === steps.length - 1 ? 'Finish' : 'Next'}<ArrowRight className="h-4 w-4" /></button>
                                </div>
                            </>}
                        </div>
                    </div>
                )}
			</div>
			<button type="button" onClick={downloadXml} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-5 text-base font-semibold text-white shadow-sm transition-colors hover:brightness-95"><Download className="h-[18px] w-[18px]" aria-hidden="true" />{t?.kycPreview?.downloadXml || 'Download XML'}</button>
		</div>
	);
}

function EmptyOptions() {
    return <div className="mt-6 rounded-md border border-dashed border-[var(--brand-border)] p-4 text-sm text-[var(--brand-text-secondary)]">No answer options have been configured for this field yet.</div>;
}
