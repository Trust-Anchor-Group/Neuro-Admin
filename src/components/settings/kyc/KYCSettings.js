"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from "react-icons/fa";
import { ChevronDown, GripVertical, Info, Plus, Trash2, X } from "lucide-react";
import KYCSettingsPreview from './KYCSettingsPreview';
import { useLanguage, content } from '../../../../context/LanguageContext';

const CUSTOM_FIELDS_STORAGE_KEY = 'kycCustomFields';

const createCustomField = () => ({
  id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  fieldId: '',
  label: '',
  type: '',
  required: true,
  placeholder: '',
  options: [{ id: `option-${Date.now()}`, value: '' }],
  custom: true,
});

const readCustomFields = () => {
  try {
    const stored = window.localStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
    const fields = stored ? JSON.parse(stored) : [];
    return Array.isArray(fields) ? fields.filter((field) => field?.custom && field?.fieldId) : [];
  } catch {
    return [];
  }
};

const customFieldId = (label, index, existingId) => {
  if (existingId) return existingId;
  const slug = String(label || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
  return `CUSTOM_${slug || `FIELD_${index + 1}`}`;
};

export default function KYCSettings() {
  const { language } = useLanguage();
  const t = useMemo(() => {
    return content?.[language]?.KYCSettings || content?.[language]?.KYCSetting || {};
  }, [language]);
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isCustomFieldsOpen, setIsCustomFieldsOpen] = useState(false);
  const [showCustomFieldsInfo, setShowCustomFieldsInfo] = useState(true);
  const [customFields, setCustomFields] = useState([
    createCustomField(),
  ]);
  const [openInputTypeFieldId, setOpenInputTypeFieldId] = useState(null);
  const dismissTimerRef = useRef(null);
  const inputTypeOptions = [
    { value: "radio", label: "Radio" },
    { value: "checkboxes", label: "Checkboxes" },
    { value: "text", label: "Text input" },
  ];

  const loadErrorMsg = t?.messages?.loadError || "Failed to load KYC settings.";
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/getPeerReview", {
          method: "POST",
          credentials: "include",
          headers: { "Accept": "application/json" },
        });

        if (res.status === 403) {
          setSettings(null);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch settings");

        const json = await res.json();
        const data = json?.data || {};

        const savedCustomFields = readCustomFields();
        const formattedSettings = {
          peerReview: data.allowPeerReview ?? false,
          nrReviewers: parseInt(data.nrReviewersToApprove) || 2,
          nrPhotos: parseInt(data.nrPhotosRequired) || 1,
          requirePhotos: (parseInt(data.nrPhotosRequired) || 0) > 0,
          requiredFields: [
            { id: "FIRST", label: "First name", required: data.requireFirstName },
            { id: "MID", label: "Middle name", required: data.requireMiddleName },
            { id: "LAST", label: "Last name", required: data.requireLastName },
            { id: "PNR", label: "Personal number", required: data.requirePersonalNumber },
            { id: "DOB", label: "Date of birth", required: data.requireBirthDate },
            { id: "GENDER", label: "Gender", required: data.requireGender },
            { id: "NATIONALITY", label: "Nationality", required: data.requireNationality },
            { id: "ADDR", label: "Address", required: data.requireAddress },
            { id: "ZIP", label: "Postal code", required: data.requirePostalCode },
            { id: "CITY", label: "City", required: data.requireCity },
            { id: "COUNTRY", label: "Country", required: data.requireCountry },
            { id: "AREA", label: "Area", required: data.requireArea },
            { id: "REGION", label: "Region", required: data.requireRegion },
            ...savedCustomFields.map((field) => ({ ...field, id: field.fieldId })),
          ],
        };

        setSettings(formattedSettings);
        setOriginalSettings(JSON.stringify(formattedSettings));
        setCustomFields([createCustomField()]);
      } catch (error) {
        console.error("Failed to fetch peer review settings", error);
  setMessage({ type: "error", text: loadErrorMsg });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
    // cleanup on unmount
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [loadErrorMsg]);

  // auto-dismiss message after 2s
  useEffect(() => {
    if (!message?.text) return;
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    dismissTimerRef.current = setTimeout(() => {
      setMessage({ type: "", text: "" });
      dismissTimerRef.current = null;
    }, 5000);
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [message.text]);

  useEffect(() => {
    if (!isCustomFieldsOpen) return;
    setShowCustomFieldsInfo(true);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsCustomFieldsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCustomFieldsOpen]);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRequiredField = (id) => {
    setSettings((prev) => ({
      ...prev,
      requiredFields: prev.requiredFields.map((f) =>
        f.id === id ? { ...f, required: !f.required } : f
      ),
    }));
  };

  const addCustomField = () => {
    setCustomFields((prev) => [
      ...prev,
      createCustomField(),
    ]);
  };

  const updateCustomField = (id, updates) => {
    setCustomFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const selectInputType = (fieldId, type) => {
    updateCustomField(fieldId, { type });
    setOpenInputTypeFieldId(null);
  };

  const addAnswerOption = (fieldId) => {
    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: [...(field.options || []), { id: `option-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, value: "" }],
            }
          : field
      )
    );
  };

  const updateAnswerOption = (fieldId, optionId, value) => {
    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: (field.options || []).map((option) =>
                option.id === optionId ? { ...option, value } : option
              ),
            }
          : field
      )
    );
  };

  const removeAnswerOption = (fieldId, optionId) => {
    setCustomFields((prev) =>
      prev.map((field) => {
        if (field.id !== fieldId || (field.options || []).length <= 1) return field;

        return {
          ...field,
          options: field.options.filter((option) => option.id !== optionId),
        };
      })
    );
  };

  const removeCustomField = (id) => {
    setCustomFields((prev) =>
      prev.length > 1 ? prev.filter((field) => field.id !== id) : prev
    );
  };

  const openCustomFields = () => {
    setCustomFields([createCustomField()]);
    setIsCustomFieldsOpen(true);
  };

  const saveCustomFields = () => {
    const existingCustomFields = settings?.requiredFields?.filter((field) => field.custom) || [];
    const usedIds = new Set(existingCustomFields.map((field) => field.fieldId || field.id));
    const configuredFields = customFields.reduce((fields, field, index) => {
      const label = String(field.label || '').trim();
      if (!label || !field.type) return fields;

      let fieldId = customFieldId(label, index, field.fieldId);
      while (usedIds.has(fieldId)) fieldId = `${fieldId}_${index + 1}`;
      usedIds.add(fieldId);

      fields.push({
        ...field,
        fieldId,
        label,
        required: !!field.required,
        custom: true,
        options: (field.options || []).filter((option) => String(option.value || '').trim()),
      });
      return fields;
    }, []);

    if (!configuredFields.length) {
      setMessage({ type: 'error', text: 'Add a label and input type before saving a custom field.' });
      return;
    }

    const savedCustomFields = [...existingCustomFields, ...configuredFields];
    window.localStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(savedCustomFields));
    setCustomFields([createCustomField()]);
    setSettings((previous) => ({
      ...previous,
      requiredFields: [
        ...previous.requiredFields.filter((field) => !field.custom),
        ...savedCustomFields.map((field) => ({ ...field, id: field.fieldId || field.id })),
      ],
    }));
    setIsCustomFieldsOpen(false);
  };

  const saveSettings = useCallback(async () => {
    if (!settings || JSON.stringify(settings) === originalSettings) return;
    setSaving(true);
    try {
      // Map requiredFields array to individual boolean flags expected by backend
      const requiredMap = settings.requiredFields.reduce((acc, f) => {
        acc[f.id] = !!f.required;
        return acc;
      }, {});

      // Ensure minimums & consistency
      const nrReviewers = Math.max(1, Number(settings.nrReviewers) || 1);
      const nrPhotos = settings.requirePhotos ? Math.max(1, Number(settings.nrPhotos) || 1) : 0;

      const payload = {
        allowPeerReview: !!settings.peerReview,
        nrReviewersToApprove: nrReviewers.toString(),
        nrPhotosRequired: nrPhotos.toString(),
        // Individual field requirements
        requireFirstName: requiredMap.FIRST || false,
        requireMiddleName: requiredMap.MID || false,
        requireLastName: requiredMap.LAST || false,
        requirePersonalNumber: requiredMap.PNR || false,
        requireBirthDate: requiredMap.DOB || false,
        requireGender: requiredMap.GENDER || false,
        requireNationality: requiredMap.NATIONALITY || false,
        requireAddress: requiredMap.ADDR || false,
        requirePostalCode: requiredMap.ZIP || false,
        requireCity: requiredMap.CITY || false,
        requireCountry: requiredMap.COUNTRY || false,
        requireArea: requiredMap.AREA || false,
        requireRegion: requiredMap.REGION || false,
        // Optional untouched flag for completeness (kept false unless added to UI later)
        requireIso3166Compliance: false,
      };

      const res = await fetch("/api/settings/peerReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }
      const savedCustomFields = settings.requiredFields.filter((field) => field.custom);
      window.localStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(savedCustomFields));
      setMessage({ type: "success", text: t?.messages?.saveSuccess || "Settings updated successfully!" });
      setOriginalSettings(JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings", error);
      setMessage({ type: "error", text: (t?.messages?.saveError || "Failed to update settings.") + (error.message ? ` (${error.message})` : "") });
    } finally {
      setSaving(false);
    }
  }, [settings, originalSettings, t]);

	return (
		<div className="relative h-full min-h-0">
			<div className="flex h-full min-h-0 flex-col lg:flex-row lg:items-stretch gap-8">
		    <div className="flex bg-[var(--brand-navbar)] w-full lg:w-[50%] rounded-2xl p-6 lg:h-full lg:min-h-0 lg:overflow-hidden">
				{/* LEFT: Existing settings UI */}
				<div className="flex h-full min-w-0 flex-1 flex-col">
					<h2 className="text-[28px] font-bold text-[var(--brand-text)] mb-6">{t?.title || 'KYC settings'}</h2>
					{message.text && (
						<div
							className={`p-3 mb-6 rounded-md text-sm text-center ${
								message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
							}`}
						>
							{message.type === "success" ? <FaCheckCircle className="inline mr-2" /> : <FaExclamationCircle className="inline mr-2" />}
							{message.text}
						</div>
					)}

					{settings ? (
						<>
							<div className="min-h-0 flex-1 overflow-y-auto pr-1">
							{/* Peer review settings */}
							<section className="bg-[var(--brand-background)] rounded-xl border border-[var(--brand-border)] p-7 mb-6">
								<h3 className="text-lg font-semibold text-[var(--brand-text-secondary)] mb-5">{t?.sections?.peerReview || 'Peer review settings'}</h3>

								<div className="space-y-5 border-b border-[var(--brand-border)] pb-5">
									<Checkbox label={t?.fields?.requirePeerReview || "Require peer review"} checked={settings.peerReview} onChange={() => toggleSetting("peerReview")} />
									{settings.peerReview && (
										<div className="pl-7">
											<Input
												label={t?.fields?.minPeerReviewers || "Min. number of peer reviewers required"}
												value={settings.nrReviewers}
												onChange={(v) => setSettings({ ...settings, nrReviewers: Number(v) })}
											/>
										</div>
									)}
								</div>

								<div className="space-y-5 pt-5">
									<Checkbox label={t?.fields?.requirePhotos || "Require photos"} checked={settings.requirePhotos} onChange={() => toggleSetting("requirePhotos")} />
									{settings.requirePhotos && (
										<div className="pl-7">
											<Input
												label={t?.fields?.minPhotos || "Min. number of photos required"}
												value={settings.nrPhotos}
												onChange={(v) => setSettings({ ...settings, nrPhotos: Number(v) })}
											/>
										</div>
									)}
								</div>
							</section>

							{/* Required fields */}
							<section className="bg-[var(--brand-background)] rounded-xl border border-[var(--brand-border)] p-7">
								<h3 className="text-lg font-semibold text-[var(--brand-text-secondary)] mb-5">{t?.sections?.requiredFields || 'Required fields for ID creation'}</h3>

								<div className="grid grid-cols-2 gap-0 border border-[var(--brand-border)] rounded-lg divide-y divide-[var(--brand-border)]">
									{settings.requiredFields.map((field, idx) => (
										<div
											key={field.id}
											className={`flex items-center px-5 py-4 ${
												idx % 2 === 0 ? "border-r border-[var(--brand-border)]" : ""
											}`}
										>
										<Checkbox label={field.label || t?.labels?.[field.id] || field.id} checked={field.required} onChange={() => toggleRequiredField(field.id)} />
										</div>
									))}
								</div>
							</section>
							</div>

							{/* Buttons */}
							<div className="mt-6 flex shrink-0 flex-col gap-4 border-t border-[var(--brand-border)] pt-5 lg:flex-row lg:items-center lg:justify-between">
								<button
									type="button"
									onClick={openCustomFields}
									className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] px-5 text-base font-semibold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] shadow-sm transition-colors hover:brightness-95 lg:w-auto"
								>
									Create custom fields
								</button>
								<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
									<button
										onClick={() => setSettings(JSON.parse(originalSettings))}
										className="h-11 px-5 text-base font-medium border border-[var(--brand-border)] rounded-md bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] hover:brightness-95"
									>
										{t?.buttons?.reset || 'Reset changes'}
									</button>
									<button
										onClick={saveSettings}
										disabled={JSON.stringify(settings) === originalSettings || saving}
											className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-6 text-base font-semibold text-white ${
												JSON.stringify(settings) === originalSettings || saving
													? "bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] cursor-not-allowed"
													: "bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] hover:brightness-95"
											}`}
									>
										<img src="/save.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
										{t?.buttons?.save || 'Save settings'}
									</button>
								</div>
							</div>
						</>
					) : (
						<div className=''>
							<div className="flex flex-col justify-center items-center h-[50vh] max-sm:p-5">
								<FaExclamationTriangle className="size-20 max-sm:size-12" color="orange" />
								<h1 className="text-xl font-semibold max-sm:text-sm">
									{t?.unauthorized?.title || 'Unauthorized'}
								</h1>
								<div className="text-gray-500 text-lg text-center max-sm:text-sm">
									<p>{t?.unauthorized?.body || 'Administrator privileges are required to manage KYC settings.'}
										<br />{t?.unauthorized?.help || 'Please contact your administrator for further help.'}</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="bg-[var(--brand-navbar)] w-full lg:w-[50%] rounded-2xl p-6 lg:h-full lg:min-h-0 lg:overflow-y-auto">
				{/* RIGHT: Preview component */}
				<KYCSettingsPreview
					requiredFields={settings?.requiredFields || []}
					labels={t?.labels || {}}
					loading={loading}
				/>
			</div>
		</div>

			{isCustomFieldsOpen && (
				<div className="absolute -bottom-6 -left-6 -right-6 -top-[100px] z-20 overflow-hidden">
					<button
						type="button"
						aria-label="Close custom fields panel"
						className="absolute inset-0 h-full w-full bg-black/25 backdrop-blur-[3px]"
						onClick={() => setIsCustomFieldsOpen(false)}
					/>
						<aside
							className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-[var(--brand-border)] bg-[#f8f9fb] shadow-2xl lg:w-[44%]"
							role="dialog"
							aria-modal="true"
							aria-label="Custom KYC Fields"
						>
							<div className="flex-1 overflow-y-auto px-5 pb-5 pt-6">
								<h3 className="text-[28px] font-bold leading-tight text-[#181f25]">Custom KYC Fields</h3>
								<p className="mt-2 text-base leading-snug text-[#181f25]/75">
									Configure the information collected from your customers during verification.
								</p>

								{showCustomFieldsInfo && (
								<div className="mt-6 flex items-start gap-3 rounded-md bg-[#d8e5f6] px-4 py-4 text-[#155da8]">
									<Info className="mt-0.5 h-6 w-6 shrink-0" />
									<p className="flex-1 text-base leading-snug">
										Add fields to customize the information collected from your customers during verification. Fields appear in the order listed below.
									</p>
								<button
									type="button"
									onClick={() => setShowCustomFieldsInfo(false)}
									className="rounded p-1 text-[#155da8] transition-colors hover:bg-white/35"
									aria-label="Dismiss custom fields information"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
							)}

								<div className="mt-4 space-y-3.5">
								{customFields.map((field) => (
									<div key={field.id} className="flex gap-3 rounded-md border border-[#d7dde6] bg-white px-4 py-5 shadow-[inset_0_0_0_1px_rgba(24,31,37,0.04)]">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#f3f4f6] text-[#181f25]/60">
											<GripVertical className="h-[22px] w-[22px]" />
										</div>
										<div className="min-w-0 flex-1 space-y-3.5">
											<input
												type="text"
												value={field.label}
												onChange={(event) => updateCustomField(field.id, { label: event.target.value })}
												placeholder="Add Field Label"
												className="h-12 w-full rounded-md border border-[#d1d7e0] bg-white px-3.5 text-[18px] text-[#181f25] shadow-[inset_0_0_0_1px_rgba(24,31,37,0.06)] outline-none transition-colors placeholder:text-[#181f25]/60 focus:border-[var(--brand-primary)]"
											/>
											<div className="relative z-10">
												<button
													type="button"
													onClick={() => setOpenInputTypeFieldId((current) => (current === field.id ? null : field.id))}
													className="flex h-12 w-full items-center justify-between rounded-md border border-[#d1d7e0] bg-white px-3.5 text-left text-[18px] text-[#181f25]/70 shadow-[inset_0_0_0_1px_rgba(24,31,37,0.06)] outline-none transition-colors hover:border-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
													aria-haspopup="listbox"
													aria-expanded={openInputTypeFieldId === field.id}
												>
													<span>
														{inputTypeOptions.find((option) => option.value === field.type)?.label || "Choose Input Type"}
													</span>
													<ChevronDown className={`h-[22px] w-[22px] text-[#181f25]/60 transition-transform ${openInputTypeFieldId === field.id ? "rotate-180" : ""}`} />
												</button>
												{openInputTypeFieldId === field.id && (
													<div
														className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-[#d1d7e0] bg-white shadow-lg"
														role="listbox"
													>
														{inputTypeOptions.map((option) => (
															<button
																key={option.value}
																type="button"
																onClick={() => selectInputType(field.id, option.value)}
																className={`block w-full px-3.5 py-3 text-left text-[18px] transition-colors ${
																	field.type === option.value
																		? "bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]"
																		: "text-[#181f25]/70 hover:bg-[#f3f4f6]"
																}`}
																role="option"
																aria-selected={field.type === option.value}
															>
																{option.label}
															</button>
														))}
													</div>
												)}
												</div>
												{field.type === "text" && (
													<div>
														<div className="mb-2 text-base font-semibold text-[#181f25]/60">Placeholder</div>
														<label className="flex h-12 min-w-0 items-center rounded-md border border-[#d1d7e0] bg-white px-3.5 shadow-[inset_0_0_0_1px_rgba(24,31,37,0.06)] transition-colors focus-within:border-[var(--brand-primary)]">
															<input
																type="text"
																value={field.placeholder || ""}
																onChange={(event) => updateCustomField(field.id, { placeholder: event.target.value })}
																placeholder="Edit placeholder"
																className="min-w-0 flex-1 border-none bg-transparent text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/60"
															/>
														</label>
													</div>
												)}
													{(field.type === "checkboxes" || field.type === "radio") && (
													<div>
														<div className="mb-2 text-base font-semibold text-[#181f25]/60">Answer Options</div>
															<div className="space-y-2">
																{(field.options || []).map((option) => (
																	<div key={option.id} className="flex items-center gap-2">
																		<label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-md border border-[#d1d7e0] bg-white px-3.5 shadow-[inset_0_0_0_1px_rgba(24,31,37,0.06)] transition-colors focus-within:border-[var(--brand-primary)]">
																				<input
																					type={field.type === "radio" ? "radio" : "checkbox"}
																					name={`answer-option-${field.id}`}
																					disabled
																					className="h-[22px] w-[22px] shrink-0 border-[#d9dee7] accent-[var(--brand-primary)]"
																					aria-label="Answer option"
																				/>
																				<input
																				type="text"
																				value={option.value}
																				onChange={(event) => updateAnswerOption(field.id, option.id, event.target.value)}
																				placeholder="Edit answer"
																				className="min-w-0 flex-1 border-none bg-transparent text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/60"
																			/>
																		</label>
																<button
																	type="button"
																	onClick={() => removeAnswerOption(field.id, option.id)}
																	className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#d1d7e0] bg-white text-[#d11f3f] shadow-[inset_0_0_0_1px_rgba(24,31,37,0.06)] transition-colors hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-40"
																	aria-label="Remove answer option"
																	disabled={(field.options || []).length <= 1}
																>
																	<Trash2 className="h-[22px] w-[22px]" />
																</button>
															</div>
														))}
													</div>
														<button
															type="button"
															onClick={() => addAnswerOption(field.id)}
															className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#d1d7e0] bg-white px-3.5 text-[18px] font-medium text-[#181f25]/60 shadow-[inset_0_0_0_1px_rgba(24,31,37,0.06)] transition-colors hover:border-[var(--brand-primary)] hover:bg-[#e5e7eb] hover:text-[#181f25]/80"
														>
															<Plus className="h-[22px] w-[22px]" />
															Add option
														</button>
													</div>
												)}
												<div className="flex items-center justify-between gap-3">
													<label className="inline-flex h-11 items-center gap-2 rounded-md border border-[#d1d7e0] bg-white px-3.5 text-base font-medium text-[#181f25] shadow-[inset_0_0_0_1px_rgba(24,31,37,0.06)]">
														Required
														<input
															type="checkbox"
														checked={field.required}
														onChange={() => updateCustomField(field.id, { required: !field.required })}
														className="sr-only"
													/>
													<span className={`relative h-4 w-8 rounded-full border transition-colors ${field.required ? "border-[var(--BrandColors-Neuro-Access-WL,_#29BF86)] bg-[var(--BrandColors-Neuro-Access-WL,_#29BF86)]" : "border-[#181f25] bg-white"}`}>
														<span className={`absolute left-0.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-transform ${field.required ? "translate-x-4 bg-white" : "bg-[#181f25]"}`} />
													</span>
												</label>
													<button
														type="button"
														onClick={() => removeCustomField(field.id)}
														className="flex h-11 w-11 items-center justify-center rounded-md border border-[#d1d7e0] bg-white text-[#d11f3f] shadow-[inset_0_0_0_1px_rgba(24,31,37,0.06)] transition-colors hover:bg-[#fff1f3]"
														aria-label="Remove custom field"
														>
															<Trash2 className="h-[22px] w-[22px]" />
														</button>
													</div>
												</div>
										</div>
									))}
									</div>
								<div className="mt-3 rounded-lg border border-[#e2e8f0] bg-white">
								<button
									type="button"
									onClick={addCustomField}
									className="flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[18px] font-semibold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] transition-colors hover:brightness-95"
								>
									<Plus className="h-[22px] w-[22px]" />
										Add field
									</button>
								</div>
							</div>
							<div className="border-t border-[#e3e7ee] px-5 pb-6 pt-3">
								<button
								type="button"
								onClick={saveCustomFields}
								className="h-12 w-full rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] text-[18px] font-bold text-white shadow-sm transition-colors hover:brightness-95"
							>
								Save Configuration
							</button>
						</div>
					</aside>
				</div>
			)}
		</div>
	);
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer text-[var(--brand-text)] text-base">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded border-gray-300 accent-figmaPurple text-figmaPurple"
      />
      {label}
    </label>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between text-base text-[var(--brand-text)] gap-4">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 border rounded-md px-3 py-2 text-base bg-[var(--brand-background)] text-[var(--brand-text-color)] border-[var(--brand-border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-colors"
        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
      />
    </label>
  );
}
