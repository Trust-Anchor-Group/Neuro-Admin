"use client";
import { useState, useEffect, useCallback } from "react";
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from "react-icons/fa";
import KYCSettingsPreview from './KYCSettingsPreview';
import { useLanguage, content } from '../../../../context/LanguageContext';

export default function KYCSettings() {
	const { language } = useLanguage();
	const t = content?.[language]?.KYCSettings || content?.[language]?.KYCSetting || {};
	const [settings, setSettings] = useState(null);
	const [originalSettings, setOriginalSettings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });


useEffect(() => {
	async function fetchSettings() {
		try {
			const res = await fetch("/api/settings/getPeerReview", {
				method: "POST",
				credentials: "include",
				headers: {
					"Accept": "application/json",
				},
			});

			if(res.status === 403){
				return setSettings(null)
			}

			if (!res.ok) {
				throw new Error("Failed to fetch settings");
			}

			const json = await res.json();
			const data = json?.data || {};

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
				],
			};

			setSettings(formattedSettings);
			setOriginalSettings(JSON.stringify(formattedSettings));
		} catch (error) {
			console.error("Failed to fetch peer review settings", error);
			setMessage({ type: "error", text: t?.messages?.loadError || "Failed to load KYC settings." });
		} finally {
			setLoading(false);
		}
	}

	fetchSettings();
}, []);


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

	const saveSettings = useCallback(async () => {
		if (!settings || JSON.stringify(settings) === originalSettings) return;
		setSaving(true);
		try {
			const payload = {
				allowPeerReview: settings.peerReview,
				nrReviewersToApprove: settings.nrReviewers.toString(),
				nrPhotosRequired: settings.nrPhotos.toString(),
				requiredFields: settings.requiredFields
					.filter((f) => f.required)
					.map((f) => f.id),
			};

			await fetch("/api/settings/peerReview", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(payload),
			});

			setMessage({ type: "success", text: t?.messages?.saveSuccess || "Settings updated successfully!" });
			setOriginalSettings(JSON.stringify(settings));
		} catch (error) {
			setMessage({ type: "error", text: t?.messages?.saveError || "Failed to update settings." });
		} finally {
			setSaving(false);
		}
	}, [settings, originalSettings]);

	return (
		<div className="flex flex-col lg:flex-row lg:items-stretch gap-8">
		    <div className="bg-[var(--brand-navbar)] w-full lg:w-[50%] rounded-2xl p-6">
				{/* LEFT: Existing settings UI */}
				<div className="flex-1 min-w-0">
					<h2 className="text-2xl font-bold text-[var(--brand-text)] mb-6">{t?.title || 'KYC settings'}</h2>
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
							{/* Peer review settings */}
							<section className="bg-[var(--brand-background)] rounded-xl border border-[var(--brand-border)] p-6 mb-6">
								<h3 className="text-sm font-semibold text-[var(--brand-text-secondary)] mb-4">{t?.sections?.peerReview || 'Peer review settings'}</h3>

								<div className="space-y-4 border-b border-[var(--brand-border)] pb-4">
									<Checkbox label={t?.fields?.requirePeerReview || "Require peer review"} checked={settings.peerReview} onChange={() => toggleSetting("peerReview")} />
									{settings.peerReview && (
										<div className="pl-6">
											<Input
												label={t?.fields?.minPeerReviewers || "Min. number of peer reviewers required"}
												value={settings.nrReviewers}
												onChange={(v) => setSettings({ ...settings, nrReviewers: Number(v) })}
											/>
										</div>
									)}
								</div>

								<div className="space-y-4 pt-4">
									<Checkbox label={t?.fields?.requirePhotos || "Require photos"} checked={settings.requirePhotos} onChange={() => toggleSetting("requirePhotos")} />
									{settings.requirePhotos && (
										<div className="pl-6">
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
							<section className="bg-[var(--brand-background)] rounded-xl border border-[var(--brand-border)] p-6">
								<h3 className="text-sm font-semibold text-[var(--brand-text-secondary)] mb-4">{t?.sections?.requiredFields || 'Required fields for ID creation'}</h3>

								<div className="grid grid-cols-2 gap-0 border border-[var(--brand-border)] rounded-lg divide-y divide-[var(--brand-border)]">
									{settings.requiredFields.map((field, idx) => (
										<div
											key={field.id}
											className={`flex items-center px-4 py-3 ${
												idx % 2 === 0 ? "border-r border-[var(--brand-border)]" : ""
											}`}
										>
											<Checkbox label={t?.labels?.[field.id] || field.label} checked={field.required} onChange={() => toggleRequiredField(field.id)} />
										</div>
									))}
								</div>
							</section>

							{/* Buttons */}
							<div className="flex justify-end mt-8 gap-3">
								<button
									onClick={() => setSettings(JSON.parse(originalSettings))}
									className="px-4 py-2 text-sm font-medium border border-[var(--brand-border)] rounded-md text-[var(--brand-text)] hover:bg-[var(--brand-hover)]"
								>
									{t?.buttons?.reset || 'Reset changes'}
								</button>
								<button
									onClick={saveSettings}
									disabled={JSON.stringify(settings) === originalSettings || saving}
									className={`px-5 py-2 text-sm font-semibold rounded-md ${
										JSON.stringify(settings) === originalSettings || saving
											? "bg-purple-300 cursor-not-allowed"
											: "bg-purple-600 hover:bg-purple-700 text-white"
									}`}
								>
									{t?.buttons?.save || 'Save settings'}
								</button>
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
			<div className="bg-[var(--brand-navbar)] w-full lg:w-[50%] rounded-2xl p-6">
				{/* RIGHT: Preview component */}
				<KYCSettingsPreview
					requiredFields={settings?.requiredFields || []}
					labels={t?.labels || {}}
					loading={loading}
				/>
			</div>
		</div>
	);
}

function Checkbox({ label, checked, onChange }) {
	return (
		<label className="flex items-center gap-2 cursor-pointer text-[var(--brand-text)] text-sm">
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				className="w-4 h-4 rounded border-gray-300 accent-figmaPurple text-figmaPurple"
			/>
			{label}
		</label>
	);
}

function Input({ label, value, onChange }) {
	return (
		<label className="flex items-center justify-between text-sm text-[var(--brand-text)] gap-4">
			{label}
			<input
				type="number"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-20 border rounded-md px-2 py-1 text-sm bg-[var(--brand-background)] text-[var(--brand-text-color)] border-[var(--brand-border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-colors"
				style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
			/>
		</label>
	);
}
