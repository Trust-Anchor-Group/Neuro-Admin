"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createInitialProjectWizardState, submitWizard } from "@/lib/projectWizard";
import { listIssuers, listIssuerLocalizations } from "@/lib/projectAdmin";
import { MEDIA_RULES, validateFileSize, validateImageFile } from "@/lib/mediaValidation";
import { mapBackendValidationError } from "@/lib/backendValidation";
import { ISO_COUNTRY_ALPHA3 } from "@/data/isoCountryAlpha3";

const Field = ({ label, required = false, children, hint }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium text-[var(--brand-text-secondary)]">
      {label}{required ? " *" : ""}
    </span>
    {children}
    {hint ? <span className="text-xs text-[var(--brand-text-secondary)]">{hint}</span> : null}
  </label>
);

const MAX_TAGS = 12;
const MAX_TAG_LENGTH = 30;
const SHORT_DESCRIPTION_MAX = 280;
const LONG_DESCRIPTION_MAX = 2000;
const READING_WORDS_PER_MINUTE = 180;

const sanitizeTags = (rawValue) => {
  const values = Array.isArray(rawValue)
    ? rawValue
    : String(rawValue || "").split(",");

  const uniqueTags = [];
  const seen = new Set();

  values.forEach((entry) => {
    const cleaned = String(entry || "").replace(/\s+/g, " ").trim();
    if (!cleaned) return;
    const truncated = cleaned.slice(0, MAX_TAG_LENGTH);
    const normalizedKey = truncated.toLowerCase();
    if (seen.has(normalizedKey)) return;
    seen.add(normalizedKey);
    uniqueTags.push(truncated);
  });

  return uniqueTags.slice(0, MAX_TAGS);
};

const tagsToInput = (tags) => (Array.isArray(tags) ? tags.join(", ") : "");

const TagPreview = ({ tags }) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return <span className="text-xs text-[var(--brand-text-secondary)]">No tags yet.</span>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-background)] px-2 py-0.5 text-xs text-[var(--brand-text)]">
          {tag}
        </span>
      ))}
    </div>
  );
};

const normalizeTextBlock = (value) => String(value || "")
  .replace(/\r\n/g, "\n")
  .split("\n")
  .map((line) => line.replace(/\s+$/g, ""))
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const getDescriptionStats = (value) => {
  const raw = String(value || "");
  const trimmed = raw.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.ceil(words / READING_WORDS_PER_MINUTE));
  return {
    words,
    characters: trimmed.length,
    paragraphs,
    readMinutes,
  };
};

const DescriptionInsights = ({ value, max, mode }) => {
  const stats = getDescriptionStats(value);
  const isShort = mode === "short";
  const qualityText = isShort
    ? (stats.characters < 80 ? "Try 80+ chars for better marketplace cards." : "Good summary length for listing cards.")
    : (stats.paragraphs < 2 ? "Consider splitting into sections for readability." : "Structured well for long-form reading.");

  return (
    <div className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-xs text-[var(--brand-text-secondary)]">
      <div className="flex flex-wrap gap-3">
        <span>{stats.characters}/{max} chars</span>
        <span>{stats.words} words</span>
        {!isShort ? <span>{stats.paragraphs} paragraphs</span> : null}
        {!isShort ? <span>~{stats.readMinutes} min read</span> : null}
      </div>
      <p className="mt-1">{qualityText}</p>
    </div>
  );
};

export default function CreateProjectWizard() {
  const [wizardState, setWizardState] = useState(createInitialProjectWizardState);
  const [issuerMode, setIssuerMode] = useState("new");
  const [selectedIssuerId, setSelectedIssuerId] = useState("");
  const [issuerOptions, setIssuerOptions] = useState([]);
  const [issuersLoading, setIssuersLoading] = useState(false);
  const [issuersError, setIssuersError] = useState("");
  const [wizardStep, setWizardStep] = useState(1);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createdProjectId, setCreatedProjectId] = useState("");
  const [createError, setCreateError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [issuerLogoPreviewUrl, setIssuerLogoPreviewUrl] = useState("");
  const [uploadFeedback, setUploadFeedback] = useState({ errors: {}, warnings: {} });
  const [tagDrafts, setTagDrafts] = useState({
    "en-US": "",
    "pt-PT": "",
  });

  const backendHost = process.env.NEXT_PUBLIC_AGENT_HOST || process.env.AGENT_HOST || "mateo.lab.tagroot.io";
  const countryOptions = ISO_COUNTRY_ALPHA3;
  const countryNameByCode = useMemo(
    () => new Map(countryOptions.map((item) => [item.code, item.name])),
    [countryOptions]
  );

  const resolveBackendAssetUrl = useCallback((rawUrl) => {
    const value = String(rawUrl || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/nex-resources/')) return `https://${backendHost}${value}`;
    return value.startsWith('/') ? value : `/${value}`;
  }, [backendHost]);

  const getIssuerLogoUrl = useCallback((localizationEntry) => {
    const candidates = [
      localizationEntry?.profile_photo?.url,
      localizationEntry?.profilePhoto?.url,
      localizationEntry?.issuer_profile_photo?.url,
      localizationEntry?.issuerProfilePhoto?.url,
      localizationEntry?.image?.url,
      localizationEntry?.photo?.url,
      localizationEntry?.logo?.url,
      localizationEntry?.logo_url,
      localizationEntry?.image_url,
      localizationEntry?.photo_url,
    ];

    const found = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim()) || '';
    return resolveBackendAssetUrl(found);
  }, [resolveBackendAssetUrl]);

  const wizardValidation = useMemo(() => {
    const steps = {
      1: { issues: [], fieldErrors: {} },
      2: { issues: [], fieldErrors: {} },
      3: { issues: [], fieldErrors: {} },
      4: { issues: [], fieldErrors: {} },
    };

    const issuerEn = wizardState.issuer["en-US"];
    const financials = wizardState.projectFinancials;
    const en = wizardState.projectContent["en-US"];
    const pt = wizardState.projectContent["pt-PT"];
    const media = wizardState.media;

    if (issuerMode === "existing" && !String(selectedIssuerId || "").trim()) {
      steps[1].issues.push("Please select an existing issuer.");
    }

    if (!issuerEn.name.trim()) steps[1].issues.push("EN issuer name is required.");
    if (issuerEn.name.trim() && (issuerEn.name.trim().length < 5 || issuerEn.name.trim().length > 40)) {
      steps[1].issues.push("EN issuer name must be between 5 and 40 characters.");
    }
    if (!issuerEn.about.trim()) steps[1].issues.push("EN issuer about is required.");
    if (!issuerEn.location.trim()) steps[1].issues.push("EN issuer location is required.");
    if (!issuerEn.industry.trim()) steps[1].issues.push("EN issuer industry is required.");

    if (!String(financials.currency ?? "").trim()) steps[1].issues.push("Currency is required.");

    const numericFinancialFields = [
      ["token_quantity", "Token quantity"],
      ["token_price", "Token price"],
      ["token_premium", "Token premium"],
    ];

    numericFinancialFields.forEach(([key, label]) => {
      const value = financials[key];
      if (String(value ?? "").trim() === "") {
        steps[1].issues.push(`${label} is required.`);
      }
    });

    if (!String(financials.token_friendly_name ?? "").trim()) steps[1].issues.push("Token friendly name is required.");
    if (!String(financials.project_label ?? "").trim()) steps[1].issues.push("Project label is required.");
    if (!String(financials.project_type ?? "").trim()) steps[1].issues.push("Project type is required.");
    const countryCode = String(financials.project_country_code ?? "").trim().toUpperCase();
    if (!countryCode) steps[1].issues.push("Project country code is required.");
    if (countryCode && countryCode.length !== 3) {
      steps[1].issues.push("Country code must be exactly 3 characters.");
    }
    if (countryCode && !countryNameByCode.has(countryCode)) {
      steps[1].issues.push("Select a valid ISO 3166-1 alpha-3 country code.");
    }

    const descriptionLength = String(financials.token_description || "").trim().length;
    if (descriptionLength < 50 || descriptionLength > 200) {
      const msg = "description have to be between 50 and 200 characters.";
      steps[1].issues.push(msg);
      steps[1].fieldErrors.token_description = msg;
    }

    const minInvestment = Number(financials.min_investment);
    const maxInvestment = Number(financials.max_investment);
    if (!Number.isNaN(minInvestment) && !Number.isNaN(maxInvestment) && maxInvestment < minInvestment) {
      steps[1].issues.push("Maximum investment must be greater than or equal to minimum investment.");
    }

    if (!en.title.trim()) steps[2].issues.push("EN title is required.");
    if (!en.asset_type.trim()) steps[2].issues.push("EN asset type is required.");
    if (!en.short_description.trim()) steps[2].issues.push("EN short description is required.");
    if (!en.long_description.trim()) steps[2].issues.push("EN long description is required.");

    if (!pt.title.trim()) steps[3].issues.push("PT title is required.");
    if (!pt.asset_type.trim()) steps[3].issues.push("PT asset type is required.");
    if (!pt.short_description.trim()) steps[3].issues.push("PT short description is required.");
    if (!pt.long_description.trim()) steps[3].issues.push("PT long description is required.");

    if (!media.thumbnail) steps[4].issues.push("Thumbnail is required.");
    media.resources.forEach((resource, index) => {
      if (!resource?.title?.trim()) steps[4].issues.push(`Resource ${index + 1} title is required.`);
      if (!resource?.file) steps[4].issues.push(`Resource ${index + 1} file is required.`);
    });

    const stepStatus = [1, 2, 3, 4].reduce((acc, step) => {
      acc[step] = {
        complete: steps[step].issues.length === 0,
        issues: steps[step].issues,
        fieldErrors: steps[step].fieldErrors,
      };
      return acc;
    }, {});

    const firstIncompleteStep = [1, 2, 3, 4].find((step) => !stepStatus[step].complete) || null;

    return {
      steps: stepStatus,
      allComplete: [1, 2, 3, 4].every((step) => stepStatus[step].complete),
      firstIncompleteStep,
    };
  }, [wizardState, issuerMode, selectedIssuerId, countryNameByCode]);

  const completedSteps = useMemo(
    () => [1, 2, 3, 4].filter((step) => wizardValidation.steps[step].complete).length,
    [wizardValidation]
  );

  const hasUploadErrors = useMemo(
    () => Object.values(uploadFeedback.errors || {}).some((message) => String(message || "").trim()),
    [uploadFeedback.errors]
  );

  useEffect(() => {
    let active = true;

    const loadIssuers = async () => {
      setIssuersLoading(true);
      setIssuersError("");

      try {
        const data = await listIssuers();
        if (!active) return;

        const options = (Array.isArray(data) ? data : []).map((item) => {
          const id = item?.issuer_id || item?.id || "";
          const label = item?.issuer_name || item?.name || id;
          return {
            id,
            label,
            raw: item,
          };
        }).filter((item) => item.id);

        setIssuerOptions(options);
      } catch (error) {
        if (!active) return;
        setIssuersError(error?.message || "Failed to load issuers.");
      } finally {
        if (active) {
          setIssuersLoading(false);
        }
      }
    };

    loadIssuers();
    return () => {
      active = false;
    };
  }, []);

  const handleIssuerModeChange = (event) => {
    const mode = event.target.value;
    setIssuerMode(mode);
    if (mode === "new") {
      setSelectedIssuerId("");
      if (!wizardState?.issuerLogo) {
        setIssuerLogoPreviewUrl("");
      }
    }
  };

  const handleIssuerSelectionChange = async (event) => {
    const nextIssuerId = event.target.value;
    setSelectedIssuerId(nextIssuerId);

    if (!nextIssuerId) {
      return;
    }

    try {
      const localizations = await listIssuerLocalizations(nextIssuerId);
      const list = Array.isArray(localizations) ? localizations : [];
      const en = list.find((item) => item?.localization === "en-US") || list[0] || {};
      const pt = list.find((item) => item?.localization === "pt-PT") || {};

      setWizardState((prev) => ({
        ...prev,
        issuer: {
          "en-US": {
            name: en?.name || prev.issuer["en-US"].name || "",
            about: en?.about || prev.issuer["en-US"].about || "",
            location: en?.location || prev.issuer["en-US"].location || "",
            industry: en?.industry || prev.issuer["en-US"].industry || "",
          },
          "pt-PT": {
            name: pt?.name || prev.issuer["pt-PT"].name || en?.name || prev.issuer["en-US"].name || "",
            about: pt?.about || prev.issuer["pt-PT"].about || en?.about || prev.issuer["en-US"].about || "",
            location: pt?.location || prev.issuer["pt-PT"].location || en?.location || prev.issuer["en-US"].location || "",
            industry: pt?.industry || prev.issuer["pt-PT"].industry || en?.industry || prev.issuer["en-US"].industry || "",
          },
        },
      }));
      setIssuerLogoPreviewUrl(getIssuerLogoUrl(en));
    } catch {
    }
  };

  const onIssuerChange = (localization, event) => {
    const { name, value } = event.target;
    setWizardState((prev) => ({
      ...prev,
      issuer: {
        ...prev.issuer,
        [localization]: {
          ...prev.issuer[localization],
          [name]: value,
        },
      },
    }));

    if (localization === "en-US" && name === "name") {
      setFieldErrors((prev) => ({ ...prev, issuerName: "" }));
    }
  };

  const onIssuerLogoChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setUploadFeedback((prev) => ({
        ...prev,
        errors: { ...prev.errors, issuerLogo: "" },
        warnings: { ...prev.warnings, issuerLogo: "" },
      }));
    }

    if (file) {
      validateImageFile(file, {
        label: "Issuer logo",
        maxBytes: MEDIA_RULES.imageMaxBytes,
        minWidth: MEDIA_RULES.logoMinWidth,
        minHeight: MEDIA_RULES.logoMinHeight,
      }).then((result) => {
        setUploadFeedback((prev) => ({
          ...prev,
          errors: { ...prev.errors, issuerLogo: result.error || "" },
          warnings: { ...prev.warnings, issuerLogo: result.warning || "" },
        }));

        if (result.error) {
          setWizardState((prev) => ({ ...prev, issuerLogo: null }));
          setIssuerLogoPreviewUrl("");
          return;
        }

        const objectUrl = URL.createObjectURL(file);
        setIssuerLogoPreviewUrl(objectUrl);
        setWizardState((prev) => ({ ...prev, issuerLogo: file }));
      });
      return;
    }

    setIssuerLogoPreviewUrl("");
    setWizardState((prev) => ({ ...prev, issuerLogo: null }));
  };

  const onFinancialChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "project_country_code") {
      value = String(value || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
    }

    if (name === "currency") {
      value = String(value || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
    }

    setWizardState((prev) => ({
      ...prev,
      projectFinancials: {
        ...prev.projectFinancials,
        [name]: value,
      },
    }));

    if (name === "project_country_code") {
      setFieldErrors((prev) => ({ ...prev, projectCountry: "" }));
    }
  };

  const onTagInputChange = (localization, value) => {
    setTagDrafts((prev) => ({
      ...prev,
      [localization]: value,
    }));

    onContentChange(localization, "tags", sanitizeTags(value));
  };

  const onTagInputBlur = (localization) => {
    setTagDrafts((prev) => ({
      ...prev,
      [localization]: tagsToInput(sanitizeTags(prev[localization])),
    }));
  };

  const onDescriptionBlur = (localization, field) => {
    const current = wizardState?.projectContent?.[localization]?.[field] || "";
    const normalized = normalizeTextBlock(current);
    if (normalized === current) return;
    onContentChange(localization, field, normalized);
  };

  const copyEnContentToPt = () => {
    const enContent = wizardState?.projectContent?.["en-US"] || {};
    const nextPtTags = sanitizeTags(enContent.tags || []);

    setWizardState((prev) => ({
      ...prev,
      projectContent: {
        ...prev.projectContent,
        "pt-PT": {
          ...prev.projectContent["pt-PT"],
          title: enContent.title || "",
          asset_type: enContent.asset_type || "",
          short_description: enContent.short_description || "",
          long_description: enContent.long_description || "",
          tags: nextPtTags,
        },
      },
    }));

    setTagDrafts((prev) => ({
      ...prev,
      "pt-PT": tagsToInput(nextPtTags),
    }));
  };

  const onContentChange = (localization, field, value) => {
    setWizardState((prev) => ({
      ...prev,
      projectContent: {
        ...prev.projectContent,
        [localization]: {
          ...prev.projectContent[localization],
          [field]: value,
        },
      },
    }));
  };

  const onThumbnailChange = async (event) => {
    const file = event.target.files?.[0] || null;

    const result = await validateImageFile(file, {
      label: "Thumbnail",
      maxBytes: MEDIA_RULES.imageMaxBytes,
      minWidth: MEDIA_RULES.mediaMinWidth,
      minHeight: MEDIA_RULES.mediaMinHeight,
    });

    setUploadFeedback((prev) => ({
      ...prev,
      errors: { ...prev.errors, thumbnail: result.error || "" },
      warnings: { ...prev.warnings, thumbnail: result.warning || "" },
    }));

    if (result.error) {
      setWizardState((prev) => ({
        ...prev,
        media: {
          ...prev.media,
          thumbnail: null,
        },
      }));
      return;
    }

    setWizardState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        thumbnail: file,
      },
    }));
  };

  const onGalleryChange = async (event) => {
    const files = Array.from(event.target.files || []);

    const acceptedFiles = [];
    const errors = [];
    const warnings = [];

    for (const file of files) {
      const result = await validateImageFile(file, {
        label: `Gallery image ${file.name}`,
        maxBytes: MEDIA_RULES.imageMaxBytes,
        minWidth: MEDIA_RULES.mediaMinWidth,
        minHeight: MEDIA_RULES.mediaMinHeight,
      });

      if (result.error) {
        errors.push(result.error);
        continue;
      }

      if (result.warning) {
        warnings.push(result.warning);
      }

      acceptedFiles.push(file);
    }

    setUploadFeedback((prev) => ({
      ...prev,
      errors: { ...prev.errors, gallery: errors.join(" ") },
      warnings: { ...prev.warnings, gallery: warnings.join(" ") },
    }));

    setWizardState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        galleryImages: acceptedFiles,
      },
    }));
  };

  const addResource = () => {
    setWizardState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        resources: [...prev.media.resources, { file: null, title: "" }],
      },
    }));
  };

  const removeResource = (index) => {
    setWizardState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        resources: prev.media.resources.filter((_, i) => i !== index),
      },
    }));
  };

  const onResourceTitleChange = (index, value) => {
    setWizardState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        resources: prev.media.resources.map((item, i) => (i === index ? { ...item, title: value } : item)),
      },
    }));
  };

  const onResourceFileChange = (index, event) => {
    const file = event.target.files?.[0] || null;

    const result = validateFileSize(file, {
      label: `Resource ${index + 1}`,
      maxBytes: MEDIA_RULES.resourceMaxBytes,
    });

    setUploadFeedback((prev) => ({
      ...prev,
      errors: { ...prev.errors, [`resource-${index}`]: result.error || "" },
      warnings: { ...prev.warnings, [`resource-${index}`]: result.warning || "" },
    }));

    if (result.error) {
      return;
    }

    setWizardState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        resources: prev.media.resources.map((item, i) => (i === index ? { ...item, file } : item)),
      },
    }));
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    setCreateError("");
    setCreateMessage("");
    setCreatedProjectId("");
    setFieldErrors({});

    if (hasUploadErrors) {
      setCreateError("Please fix upload issues first. Large files must be compressed before upload.");
      setWizardStep(4);
      return;
    }

    if (!wizardValidation.allComplete) {
      const firstStep = wizardValidation.firstIncompleteStep || 1;
      setWizardStep(firstStep);
      setCreateError(`Please complete Step ${firstStep} before publishing.`);
      return;
    }

    setCreateLoading(true);

    try {
      const result = await submitWizard({
        ...wizardState,
        existingIssuerId: issuerMode === "existing" ? selectedIssuerId : "",
      });
      setCreateMessage("Project published successfully.");
      setCreatedProjectId(result.projectId || "");
      setWizardState(createInitialProjectWizardState());
      setIssuerMode("new");
      setSelectedIssuerId("");
      setIssuerLogoPreviewUrl("");
      setTagDrafts({ "en-US": "", "pt-PT": "" });
      setWizardStep(1);
    } catch (error) {
      const mapped = mapBackendValidationError(error);
      setFieldErrors(mapped.fieldErrors || {});
      setCreateError(mapped.formError || mapped.backendMessage || "Failed to create project.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5">
      <h2 className="text-2xl font-semibold text-[var(--brand-text)]">Create Project Wizard</h2>
      <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">Complete each step. API calls are triggered only on Publish.</p>
      <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">Progress: {completedSteps}/4 steps complete</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => setWizardStep(step)}
            className={`rounded-md px-3 py-1 text-sm ${wizardStep === step ? "bg-[var(--brand-accent)] text-[var(--brand-primary)]" : "bg-[var(--brand-background)] text-[var(--brand-text)] border border-[var(--brand-border)]"}`}
          >
            <span className="mr-2">Step {step}</span>
            <span className={`rounded px-2 py-0.5 text-xs ${wizardValidation.steps[step].complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {wizardValidation.steps[step].complete ? "Complete" : "Incomplete"}
            </span>
          </button>
        ))}
      </div>

      {!wizardValidation.steps[wizardStep].complete && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-700">Step {wizardStep} needs attention:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-amber-700">
            {wizardValidation.steps[wizardStep].issues.map((issue, index) => (
              <li key={`${wizardStep}-issue-${index}`}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handlePublish}>
        {wizardStep === 1 && (
          <>
            <Field label="Issuer Source" required>
              <select
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2"
                value={issuerMode}
                onChange={handleIssuerModeChange}
              >
                <option value="new">Create new issuer</option>
                <option value="existing">Use existing issuer</option>
              </select>
            </Field>

            {issuerMode === "existing" && (
              <Field label="Existing Issuer" required>
                <select
                  className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2"
                  value={selectedIssuerId}
                  onChange={handleIssuerSelectionChange}
                  disabled={issuersLoading}
                >
                  <option value="">Select issuer</option>
                  {issuerOptions.map((issuerOption) => (
                    <option key={issuerOption.id} value={issuerOption.id}>
                      {issuerOption.label}
                    </option>
                  ))}
                </select>
                {issuersError ? <span className="text-xs text-[var(--status-error,#ef4444)]">{issuersError}</span> : null}
              </Field>
            )}

            <div className="md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3">
              <h3 className="mb-2 text-sm font-semibold text-[var(--brand-text)]">Issuer Localization (EN)</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Issuer Name (EN)" required>
                  <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={40} name="name" value={wizardState.issuer["en-US"].name} onChange={(event) => onIssuerChange("en-US", event)} placeholder="Issuer name in English" />
                  {fieldErrors.issuerName ? <span className="text-xs text-[var(--status-error,#ef4444)]">{fieldErrors.issuerName}</span> : null}
                </Field>
                <Field label="Issuer About (EN)" required>
                  <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={180} name="about" value={wizardState.issuer["en-US"].about} onChange={(event) => onIssuerChange("en-US", event)} placeholder="Issuer about in English" />
                </Field>
                <Field label="Issuer Location (EN)" required>
                  <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={80} name="location" value={wizardState.issuer["en-US"].location} onChange={(event) => onIssuerChange("en-US", event)} placeholder="Issuer location in English" />
                </Field>
                <Field label="Issuer Industry (EN)" required>
                  <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={80} name="industry" value={wizardState.issuer["en-US"].industry} onChange={(event) => onIssuerChange("en-US", event)} placeholder="Issuer industry in English" />
                </Field>
              </div>
            </div>

            <div className="md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3">
              <h3 className="mb-2 text-sm font-semibold text-[var(--brand-text)]">Issuer Localization (PT)</h3>
              <p className="mb-2 text-xs text-[var(--brand-text-secondary)]">If a PT field is empty, EN value will be used automatically.</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Issuer Name (PT)">
                  <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={40} name="name" value={wizardState.issuer["pt-PT"].name} onChange={(event) => onIssuerChange("pt-PT", event)} placeholder="Issuer name in Portuguese" />
                </Field>
                <Field label="Issuer About (PT)">
                  <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={180} name="about" value={wizardState.issuer["pt-PT"].about} onChange={(event) => onIssuerChange("pt-PT", event)} placeholder="Issuer about in Portuguese" />
                </Field>
                <Field label="Issuer Location (PT)">
                  <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={80} name="location" value={wizardState.issuer["pt-PT"].location} onChange={(event) => onIssuerChange("pt-PT", event)} placeholder="Issuer location in Portuguese" />
                </Field>
                <Field label="Issuer Industry (PT)">
                  <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={80} name="industry" value={wizardState.issuer["pt-PT"].industry} onChange={(event) => onIssuerChange("pt-PT", event)} placeholder="Issuer industry in Portuguese" />
                </Field>
              </div>
            </div>
            <Field label="Issuer Logo (Company)">
              <input type="file" accept="image/*" className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" onChange={onIssuerLogoChange} />
              {issuerLogoPreviewUrl ? (
                <div className="mt-2 flex items-center gap-2">
                  <img src={issuerLogoPreviewUrl} alt="Issuer logo preview" className="h-12 w-12 rounded-full border border-[var(--brand-border)] object-cover" />
                  <span className="text-xs text-[var(--brand-text-secondary)]">Current logo preview</span>
                </div>
              ) : null}
              {uploadFeedback.errors.issuerLogo ? <span className="text-xs text-[var(--status-error,#ef4444)]">{uploadFeedback.errors.issuerLogo}</span> : null}
              {uploadFeedback.warnings.issuerLogo ? <span className="text-xs text-amber-600">{uploadFeedback.warnings.issuerLogo}</span> : null}
            </Field>
            <Field label="Currency" required>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" maxLength={3} name="currency" value={wizardState.projectFinancials.currency} onChange={onFinancialChange} placeholder="USD / BRL / EUR" />
            </Field>
            <Field label="Token Quantity" required>
              <input type="number" min="0" className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" name="token_quantity" value={wizardState.projectFinancials.token_quantity} onChange={onFinancialChange} />
            </Field>
            <Field label="Token Price" required>
              <input type="number" min="0" step="any" className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" name="token_price" value={wizardState.projectFinancials.token_price} onChange={onFinancialChange} />
            </Field>
            <Field label="Token Premium" required>
              <input type="number" min="0" step="any" className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" name="token_premium" value={wizardState.projectFinancials.token_premium} onChange={onFinancialChange} />
            </Field>
            <div className="md:col-span-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-3 text-xs text-[var(--brand-text-secondary)]">
              Investment limits are set automatically: minimum `1` and maximum `1,000,000`.
            </div>
            <Field label="Token Friendly Name" required>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" name="token_friendly_name" value={wizardState.projectFinancials.token_friendly_name} onChange={onFinancialChange} />
            </Field>
            <Field label="Token Description" required>
              <textarea maxLength={200} className={`rounded-lg border bg-[var(--brand-background)] p-2 ${wizardValidation.steps[1].fieldErrors.token_description ? "border-red-400" : "border-[var(--brand-border)]"}`} rows={3} name="token_description" value={wizardState.projectFinancials.token_description} onChange={onFinancialChange} />
              <span className={`text-xs ${wizardValidation.steps[1].fieldErrors.token_description ? "text-red-500" : "text-[var(--brand-text-secondary)]"}`}>
                {wizardValidation.steps[1].fieldErrors.token_description || `${String(wizardState.projectFinancials.token_description || "").trim().length}/200 characters (min 50)`}
              </span>
            </Field>
            <Field label="Project Label" required>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" name="project_label" value={wizardState.projectFinancials.project_label} onChange={onFinancialChange} />
            </Field>
            <Field label="Project Type" required>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" name="project_type" value={wizardState.projectFinancials.project_type} onChange={onFinancialChange} />
            </Field>
            <Field label="Country Code" required hint="Search by country name or type alpha-3 code (e.g. BRA, USA, DEU)">
              <input
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2 uppercase"
                name="project_country_code"
                list="country-alpha3-list"
                maxLength={3}
                value={wizardState.projectFinancials.project_country_code}
                onChange={onFinancialChange}
                placeholder="Type code or search country"
              />
              <datalist id="country-alpha3-list">
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code}>{`${country.code} — ${country.name}`}</option>
                ))}
              </datalist>
              {wizardState.projectFinancials.project_country_code && countryNameByCode.has(wizardState.projectFinancials.project_country_code) ? (
                <span className="text-xs text-[var(--brand-text-secondary)]">{countryNameByCode.get(wizardState.projectFinancials.project_country_code)}</span>
              ) : null}
              {fieldErrors.projectCountry ? <span className="text-xs text-[var(--status-error,#ef4444)]">{fieldErrors.projectCountry}</span> : null}
            </Field>
          </>
        )}

        {wizardStep === 2 && (
          <>
            <div className="md:col-span-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-3 text-xs text-[var(--brand-text-secondary)]">
              These descriptions are shown in the marketplace. Keep short description concise and make long description scannable with clear paragraphs.
            </div>
            <Field label="EN Title" required>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" value={wizardState.projectContent["en-US"].title} onChange={(e) => onContentChange("en-US", "title", e.target.value)} />
            </Field>
            <Field label="EN Asset Type" required>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" value={wizardState.projectContent["en-US"].asset_type} onChange={(e) => onContentChange("en-US", "asset_type", e.target.value)} />
            </Field>
            <Field label="EN Short Description" required>
              <textarea maxLength={SHORT_DESCRIPTION_MAX} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" rows={3} value={wizardState.projectContent["en-US"].short_description} onChange={(e) => onContentChange("en-US", "short_description", e.target.value)} onBlur={() => onDescriptionBlur("en-US", "short_description")} />
              <DescriptionInsights value={wizardState.projectContent["en-US"].short_description} max={SHORT_DESCRIPTION_MAX} mode="short" />
            </Field>
            <Field label="EN Long Description" required>
              <textarea maxLength={LONG_DESCRIPTION_MAX} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2 leading-relaxed" rows={8} value={wizardState.projectContent["en-US"].long_description} onChange={(e) => onContentChange("en-US", "long_description", e.target.value)} onBlur={() => onDescriptionBlur("en-US", "long_description")} />
              <DescriptionInsights value={wizardState.projectContent["en-US"].long_description} max={LONG_DESCRIPTION_MAX} mode="long" />
            </Field>
            <Field label="EN Tags" hint={`Comma separated, up to ${MAX_TAGS} tags`}>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" value={tagDrafts["en-US"]} onChange={(e) => onTagInputChange("en-US", e.target.value)} onBlur={() => onTagInputBlur("en-US")} placeholder="solar, green-energy, verified" />
              <span className="text-xs text-[var(--brand-text-secondary)]">{wizardState.projectContent["en-US"].tags.length}/{MAX_TAGS} tags</span>
              <TagPreview tags={wizardState.projectContent["en-US"].tags} />
            </Field>
          </>
        )}

        {wizardStep === 3 && (
          <>
            <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2">
              <span className="text-xs text-[var(--brand-text-secondary)]">Speed up translation workflow by starting from EN content.</span>
              <button type="button" onClick={copyEnContentToPt} className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 py-1 text-xs font-medium text-[var(--brand-text)]">
                Copy EN content to PT
              </button>
            </div>
            <Field label="PT Title" required>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" value={wizardState.projectContent["pt-PT"].title} onChange={(e) => onContentChange("pt-PT", "title", e.target.value)} />
            </Field>
            <Field label="PT Asset Type" required>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" value={wizardState.projectContent["pt-PT"].asset_type} onChange={(e) => onContentChange("pt-PT", "asset_type", e.target.value)} />
            </Field>
            <Field label="PT Short Description" required>
              <textarea maxLength={SHORT_DESCRIPTION_MAX} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" rows={3} value={wizardState.projectContent["pt-PT"].short_description} onChange={(e) => onContentChange("pt-PT", "short_description", e.target.value)} onBlur={() => onDescriptionBlur("pt-PT", "short_description")} />
              <DescriptionInsights value={wizardState.projectContent["pt-PT"].short_description} max={SHORT_DESCRIPTION_MAX} mode="short" />
            </Field>
            <Field label="PT Long Description" required>
              <textarea maxLength={LONG_DESCRIPTION_MAX} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2 leading-relaxed" rows={8} value={wizardState.projectContent["pt-PT"].long_description} onChange={(e) => onContentChange("pt-PT", "long_description", e.target.value)} onBlur={() => onDescriptionBlur("pt-PT", "long_description")} />
              <DescriptionInsights value={wizardState.projectContent["pt-PT"].long_description} max={LONG_DESCRIPTION_MAX} mode="long" />
            </Field>
            <Field label="PT Tags" hint={`Separadas por vírgula, máximo ${MAX_TAGS}`}>
              <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" value={tagDrafts["pt-PT"]} onChange={(e) => onTagInputChange("pt-PT", e.target.value)} onBlur={() => onTagInputBlur("pt-PT")} placeholder="solar, energia-verde, verificado" />
              <span className="text-xs text-[var(--brand-text-secondary)]">{wizardState.projectContent["pt-PT"].tags.length}/{MAX_TAGS} tags</span>
              <TagPreview tags={wizardState.projectContent["pt-PT"].tags} />
            </Field>
          </>
        )}

        {wizardStep === 4 && (
          <>
            <Field label="Thumbnail" required hint="Uploaded to EN and PT localization endpoints">
              <input type="file" accept="image/*" className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" onChange={onThumbnailChange} />
              {uploadFeedback.errors.thumbnail ? <span className="text-xs text-[var(--status-error,#ef4444)]">{uploadFeedback.errors.thumbnail}</span> : null}
              {uploadFeedback.warnings.thumbnail ? <span className="text-xs text-amber-600">{uploadFeedback.warnings.thumbnail}</span> : null}
            </Field>
            <Field label="Gallery Images" hint="You can select multiple files">
              <input type="file" accept="image/*" multiple className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" onChange={onGalleryChange} />
              {uploadFeedback.errors.gallery ? <span className="text-xs text-[var(--status-error,#ef4444)]">{uploadFeedback.errors.gallery}</span> : null}
              {uploadFeedback.warnings.gallery ? <span className="text-xs text-amber-600">{uploadFeedback.warnings.gallery}</span> : null}
            </Field>

            <div className="md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[var(--brand-text)]">Resources</h3>
                <button type="button" onClick={addResource} className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-1 text-sm text-[var(--brand-text)]">
                  Add Resource
                </button>
              </div>

              {wizardState.media.resources.length === 0 && (
                <p className="text-sm text-[var(--brand-text-secondary)]">No resources added.</p>
              )}

              <div className="space-y-3">
                {wizardState.media.resources.map((resource, index) => (
                  <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Field label={`Resource ${index + 1} Title`}>
                      <input className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" value={resource.title} onChange={(e) => onResourceTitleChange(index, e.target.value)} />
                    </Field>
                    <Field label={`Resource ${index + 1} File`}>
                      <input type="file" className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2" onChange={(e) => onResourceFileChange(index, e)} />
                      {uploadFeedback.errors[`resource-${index}`] ? <span className="text-xs text-[var(--status-error,#ef4444)]">{uploadFeedback.errors[`resource-${index}`]}</span> : null}
                    </Field>
                    <div className="flex items-end">
                      <button type="button" onClick={() => removeResource(index)} className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button type="button" disabled={wizardStep <= 1} onClick={() => setWizardStep((step) => Math.max(1, step - 1))} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-2 font-semibold text-[var(--brand-text)] disabled:opacity-60">
              Previous
            </button>
            <button type="button" disabled={wizardStep >= 4 || !wizardValidation.steps[wizardStep].complete} onClick={() => setWizardStep((step) => Math.min(4, step + 1))} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-2 font-semibold text-[var(--brand-text)] disabled:opacity-60">
              Next
            </button>
          </div>

          <button type="submit" disabled={createLoading || !wizardValidation.allComplete || hasUploadErrors} className="rounded-lg bg-[var(--brand-accent)] px-4 py-2 font-semibold text-[var(--brand-primary)] disabled:opacity-60">
            {createLoading ? "Publishing..." : "Publish"}
          </button>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          {createMessage && (
            <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-semibold text-emerald-700">{createMessage}</p>
              {createdProjectId ? <p className="mt-1 text-xs text-emerald-700">Project ID: {createdProjectId}</p> : null}
              <p className="mt-1 text-xs text-emerald-700">All creation steps completed successfully.</p>
            </div>
          )}
          {createError && <span className="text-sm text-[var(--status-error,#ef4444)]">{createError}</span>}
        </div>
      </form>
    </section>
  );
}
