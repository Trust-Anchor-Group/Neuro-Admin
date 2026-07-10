"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  GripVertical,
  Info,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

const availableFieldGroups = [
  {
    title: "Personal Information",
    fields: [
      { id: "firstName", label: "First Name", type: "Text input" },
      { id: "middleName", label: "Middle Name", type: "Text input" },
      { id: "lastName", label: "Last Name", type: "Text input" },
      { id: "preferredName", label: "Preferred Name", type: "Text input" },
      { id: "dateOfBirth", label: "Date of Birth", type: "Date" },
      { id: "gender", label: "Gender", type: "Radio" },
      { id: "nationality", label: "Nationality", type: "Text input" },
      { id: "placeOfBirth", label: "Place of Birth", type: "Text input" },
    ],
  },
  {
    title: "Contact Information",
    fields: [
      { id: "emailAddress", label: "Email Address", type: "Email" },
      { id: "phoneNumber", label: "Phone Number", type: "Phone" },
      { id: "alternatePhoneNumber", label: "Alternate Phone Number", type: "Phone" },
    ],
  },
  {
    title: "Residential Address",
    fields: [
      { id: "streetAddressLine1", label: "Street Address Line 1", type: "Text input" },
      { id: "streetAddressLine2", label: "Street Address Line 2", type: "Text input" },
      { id: "city", label: "City", type: "Text input" },
      { id: "stateProvinceRegion", label: "State/Province/Region", type: "Text input" },
      { id: "zipPostalCode", label: "ZIP/Postal Code", type: "Text input" },
      { id: "country", label: "Country", type: "Text input" },
      { id: "yearsAtCurrentAddress", label: "Years at Current Address", type: "Number" },
    ],
  },
  {
    title: "Identification Document",
    fields: [
      { id: "documentType", label: "Document Type", type: "Select" },
      { id: "documentNumber", label: "Document Number", type: "Text input" },
      { id: "issuingCountry", label: "Issuing Country", type: "Text input" },
      { id: "issuingAuthority", label: "Issuing Authority", type: "Text input" },
      { id: "issueDate", label: "Issue Date", type: "Date" },
      { id: "expirationDate", label: "Expiration Date", type: "Date" },
    ],
  },
  {
    title: "Identity Verification",
    fields: [
      { id: "uploadFrontOfId", label: "Upload Front of ID", type: "File upload" },
      { id: "uploadBackOfId", label: "Upload Back of ID", type: "File upload" },
      { id: "selfieFaceVerification", label: "Selfie / Face Verification", type: "File upload" },
      { id: "proofOfLiveness", label: "Proof of Liveness", type: "Verification" },
    ],
  },
];

const comingSoonFieldGroups = [
  {
    title: "Proof of Address",
    comingSoon: true,
    fields: [
      { id: "proofAddressDocumentType", label: "Document Type", type: "Select" },
      { id: "proofAddressUploadDocument", label: "Upload Document", type: "File upload" },
      { id: "proofAddressDocumentDate", label: "Document Date", type: "Date" },
    ],
  },
  {
    title: "Employment & Financial Information",
    comingSoon: true,
    fields: [
      { id: "employmentStatus", label: "Employment Status", type: "Select" },
      { id: "employerName", label: "Employer Name", type: "Text input" },
      { id: "occupation", label: "Occupation", type: "Text input" },
      { id: "annualIncomeRange", label: "Annual Income Range", type: "Select" },
      { id: "sourceOfFunds", label: "Source of Funds", type: "Text input" },
      { id: "sourceOfWealth", label: "Source of Wealth", type: "Text input" },
    ],
  },
  {
    title: "Tax Information",
    comingSoon: true,
    fields: [
      { id: "taxResidency", label: "Tax Residency", type: "Text input" },
      { id: "taxIdentificationNumber", label: "Tax Identification Number (TIN)", type: "Text input" },
      { id: "fatcaCrsQuestions", label: "FATCA/CRS Questions", type: "Checkboxes" },
    ],
  },
  {
    title: "Compliance Questions",
    comingSoon: true,
    fields: [
      { id: "politicallyExposedPerson", label: "Politically Exposed Person (PEP)?", type: "Radio" },
      { id: "familyAssociatePep", label: "Family/Associate of a PEP?", type: "Radio" },
      { id: "subjectToSanctions", label: "Subject to Sanctions?", type: "Radio" },
      { id: "countryOfResidence", label: "Country of Residence", type: "Text input" },
      { id: "countryOfCitizenship", label: "Country of Citizenship", type: "Text input" },
    ],
  },
  {
    title: "Consent & Agreements",
    comingSoon: true,
    fields: [
      { id: "privacyPolicyAcceptance", label: "Privacy Policy Acceptance", type: "Checkboxes" },
      { id: "termsConditionsAcceptance", label: "Terms & Conditions Acceptance", type: "Checkboxes" },
      { id: "identityVerificationConsent", label: "Consent to Identity Verification", type: "Checkboxes" },
      { id: "electronicSignature", label: "Electronic Signature", type: "Signature" },
    ],
  },
];

const availableFields = availableFieldGroups.flatMap((group) => group.fields);
const savedKycStorageKey = "neuro-admin-my-kycs";

const inputTypeOptions = [
  { value: "radio", label: "Radio" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "text", label: "Text input" },
];

const createEmptyCustomField = () => ({
  id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  kind: "field",
  label: "",
  description: "",
  hint: "",
  inputType: "",
  required: false,
  placeholder: "",
  options: [{ id: `option-${Date.now()}`, value: "" }],
});

const createEmptyCustomGroup = () => ({
  id: `custom-group-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  kind: "group",
  label: "",
  description: "",
  hint: "",
  inputType: "group",
  required: false,
  placeholder: "",
  options: [{ id: `option-${Date.now()}`, value: "" }],
  subfields: [
    {
      id: `subfield-${Date.now()}-1`,
      label: "",
      placeholder: "",
      required: false,
    },
    {
      id: `subfield-${Date.now()}-2`,
      label: "",
      placeholder: "",
      required: false,
    },
  ],
});

const getCustomFieldType = (field) =>
  field.kind === "group"
    ? "Multi-field page item"
    : inputTypeOptions.find((option) => option.value === field.inputType)?.label || field.type || "Custom field";

const usesAnswerOptions = (field) =>
  field.inputType === "radio" ||
  field.inputType === "checkboxes" ||
  field.type === "Radio" ||
  field.type === "Checkboxes";

const normalizeCustomField = (field) => ({
  ...field,
  type: getCustomFieldType(field),
});

export default function MyKYCBuilder() {
  const [kycName, setKycName] = useState("");
  const [kycDescription, setKycDescription] = useState("");
  const [activeStep, setActiveStep] = useState("groups");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [currentConfigGroupIndex, setCurrentConfigGroupIndex] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedSelectedGroupTitle, setDraggedSelectedGroupTitle] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldGroups, setCustomFieldGroups] = useState([]);
  const [groupCustomFields, setGroupCustomFields] = useState({});
  const [editedFields, setEditedFields] = useState({});
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);
  const [customFieldTargetGroupTitle, setCustomFieldTargetGroupTitle] = useState(null);
  const [fieldBeingEdited, setFieldBeingEdited] = useState(null);
  const [availableFieldSearch, setAvailableFieldSearch] = useState("");
  const [savedKyc, setSavedKyc] = useState(null);
  const [showKycNameError, setShowKycNameError] = useState(false);
  const [editingKycId, setEditingKycId] = useState(null);

  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (!editId) return;

    const existingKycs = JSON.parse(window.localStorage.getItem(savedKycStorageKey) || "[]");
    const kycToEdit = existingKycs.find((kyc) => kyc.id === editId);
    if (!kycToEdit) return;

    const savedGroupCustomFields = kycToEdit.groups.reduce((groupFields, group) => {
      if (group.title === "Custom Fields") return groupFields;

      const baseGroup = availableFieldGroups.find((availableGroup) => availableGroup.title === group.title);
      if (!baseGroup) return groupFields;

      const baseFieldIds = new Set(baseGroup.fields.map((field) => field.id));
      const extraFields = group.fields.filter((field) => !baseFieldIds.has(field.id));

      return extraFields.length ? { ...groupFields, [group.title]: extraFields } : groupFields;
    }, {});
    const savedEditedFields = kycToEdit.groups.reduce((fieldOverrides, group) => {
      const baseGroup = availableFieldGroups.find((availableGroup) => availableGroup.title === group.title);
      if (!baseGroup) return fieldOverrides;

      const baseFieldIds = new Set(baseGroup.fields.map((field) => field.id));
      const editedBaseFields = group.fields.filter((field) => baseFieldIds.has(field.id));

      return editedBaseFields.reduce(
        (overrides, field) => ({
          ...overrides,
          [field.id]: field,
        }),
        fieldOverrides
      );
    }, {});
    const savedCustomFieldGroups = kycToEdit.groups
      .filter(
        (group) =>
          group.title === "Custom Fields" ||
          !availableFieldGroups.some((availableGroup) => availableGroup.title === group.title)
      )
      .map((group) => ({
        id: `custom-kyc-group-${group.title}`,
        title: group.title,
        description: group.description || "",
        fields: group.fields,
      }));

    setEditingKycId(editId);
    setKycName(kycToEdit.name || "");
    setKycDescription(kycToEdit.description || "");
    setSelectedGroups(kycToEdit.groups.map((group) => group.title));
    setSelectedFieldIds(kycToEdit.groups.flatMap((group) => group.fields.map((field) => field.id)));
    setCustomFields([]);
    setCustomFieldGroups(savedCustomFieldGroups);
    setGroupCustomFields(savedGroupCustomFields);
    setEditedFields(savedEditedFields);
    setShowKycNameError(false);
  }, []);

  const applyFieldEdits = (field) => ({ ...field, ...(editedFields[field.id] || {}) });

  const availableGroupsWithCustomFields = [
    ...availableFieldGroups.map((group) => ({
      ...group,
      fields: [...group.fields, ...(groupCustomFields[group.title] || []).map(normalizeCustomField)].map(applyFieldEdits),
    })),
    ...comingSoonFieldGroups,
    ...customFieldGroups.map((group) => ({
      ...group,
      fields: [...group.fields, ...(groupCustomFields[group.title] || [])].map(normalizeCustomField).map(applyFieldEdits),
    })),
  ];

  const selectedGroupDetails = selectedGroups
    .map((groupTitle) => availableGroupsWithCustomFields.find((group) => group.title === groupTitle))
    .filter(Boolean);
  const currentConfigGroup =
    selectedGroupDetails[Math.min(currentConfigGroupIndex, Math.max(selectedGroupDetails.length - 1, 0))];
  const currentPreviewFields =
    currentConfigGroup?.fields.filter((field) => selectedFieldIds.includes(field.id)) || [];

  const visibleAvailableGroups = availableGroupsWithCustomFields.filter((group) => {
    const searchValue = availableFieldSearch.trim().toLowerCase();
    if (!searchValue) return true;
    return (
      group.title.toLowerCase().includes(searchValue) ||
      group.fields.some((field) => `${field.label} ${field.type}`.toLowerCase().includes(searchValue))
    );
  });

  const addGroup = (groupTitle) => {
    const group = availableGroupsWithCustomFields.find((item) => item.title === groupTitle);
    if (!group || group.comingSoon || selectedGroups.includes(group.title)) return;
    setSelectedGroups((current) => [...current, group.title]);
  };

  const removeGroup = (groupTitle) => {
    const group = availableGroupsWithCustomFields.find((item) => item.title === groupTitle);
    setSelectedGroups((current) => current.filter((title) => title !== groupTitle));
    if (group) {
      setSelectedFieldIds((current) => current.filter((fieldId) => !group.fields.some((field) => field.id === fieldId)));
    }
    setCurrentConfigGroupIndex((current) => Math.max(0, Math.min(current, selectedGroups.length - 2)));
  };

  const handleDragStart = (event, groupTitle) => {
    event.dataTransfer.setData("text/plain", groupTitle);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const selectedGroupTitle = event.dataTransfer.getData("application/x-kyc-selected-group");

    if (selectedGroupTitle) {
      moveSelectedGroup(selectedGroupTitle);
      setDraggedSelectedGroupTitle(null);
      return;
    }

    addGroup(event.dataTransfer.getData("text/plain"));
  };

  const moveSelectedGroup = (groupTitle, beforeGroupTitle = null) => {
    setSelectedGroups((current) => {
      const currentIndex = current.findIndex((title) => title === groupTitle);
      if (currentIndex === -1 || groupTitle === beforeGroupTitle) return current;

      const next = [...current];
      const [movedGroupTitle] = next.splice(currentIndex, 1);

      if (!beforeGroupTitle) return [...next, movedGroupTitle];

      const targetIndex = next.findIndex((title) => title === beforeGroupTitle);
      if (targetIndex === -1) return current;

      next.splice(targetIndex, 0, movedGroupTitle);
      return next;
    });
  };

  const handleSelectedDragStart = (event, groupTitle) => {
    event.dataTransfer.setData("application/x-kyc-selected-group", groupTitle);
    event.dataTransfer.effectAllowed = "move";
    setDraggedSelectedGroupTitle(groupTitle);
  };

  const startConfiguration = () => {
    if (!kycName.trim()) {
      setShowKycNameError(true);
      return;
    }

    const nextFieldIds = selectedGroupDetails.flatMap((group) => group.fields.map((field) => field.id));
    setSelectedFieldIds((current) => {
      const stillAvailable = current.filter((fieldId) => nextFieldIds.includes(fieldId));
      const newFieldIds = nextFieldIds.filter((fieldId) => !stillAvailable.includes(fieldId));
      return [...stillAvailable, ...newFieldIds];
    });
    setCurrentConfigGroupIndex(0);
    setActiveStep("configure");
  };

  const toggleField = (fieldId) => {
    setSelectedFieldIds((current) =>
      current.includes(fieldId) ? current.filter((id) => id !== fieldId) : [...current, fieldId]
    );
  };

  const saveCustomFieldGroup = (fields, pageTitle, pageDescription) => {
    const nextPageTitle = pageTitle.trim();
    const nextFields = fields.map(normalizeCustomField);

    setCustomFieldGroups((current) => [
      ...current,
      {
        id: `custom-kyc-page-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: nextPageTitle,
        description: pageDescription.trim(),
        fields: nextFields,
      },
    ]);
    setIsCustomFieldModalOpen(false);
    setCustomFieldTargetGroupTitle(null);
  };

  const saveFieldsToGroup = (fields, groupTitle) => {
    const nextFields = fields.map(normalizeCustomField);

    setGroupCustomFields((current) => ({
      ...current,
      [groupTitle]: [...(current[groupTitle] || []), ...nextFields],
    }));

    setSelectedFieldIds((current) => [
      ...current,
      ...nextFields.map((field) => field.id).filter((fieldId) => !current.includes(fieldId)),
    ]);
    setIsCustomFieldModalOpen(false);
    setCustomFieldTargetGroupTitle(null);
  };

  const saveEditedField = (field) => {
    const nextField = normalizeCustomField(field);

    setEditedFields((current) => ({
      ...current,
      [nextField.id]: nextField,
    }));
    setIsCustomFieldModalOpen(false);
    setCustomFieldTargetGroupTitle(null);
    setFieldBeingEdited(null);
  };

  const goToPreviousStep = () => {
    if (activeStep !== "configure") return;
    if (currentConfigGroupIndex > 0) {
      setCurrentConfigGroupIndex((current) => current - 1);
      return;
    }
    setActiveStep("groups");
  };

  const goToNextStep = () => {
    if (activeStep === "groups") {
      startConfiguration();
      return;
    }

    if (currentConfigGroupIndex < selectedGroupDetails.length - 1) {
      setCurrentConfigGroupIndex((current) => current + 1);
      return;
    }

    saveCreatedKyc();
  };

  const saveCreatedKyc = () => {
    const now = new Date().toISOString();
    const existingKycs = JSON.parse(window.localStorage.getItem(savedKycStorageKey) || "[]");
    const existingKyc = existingKycs.find((kyc) => kyc.id === editingKycId);
    const kyc = {
      id: editingKycId || `kyc-${Date.now()}`,
      name: kycName.trim() || "Untitled KYC",
      description: kycDescription.trim(),
      createdAt: existingKyc?.createdAt || now,
      updatedAt: now,
      groups: selectedGroupDetails.map((group) => ({
        title: group.title,
        description: group.description || "",
        fields: group.fields.filter((field) => selectedFieldIds.includes(field.id)),
      })),
    };

    const nextKycs = editingKycId
      ? existingKycs.map((savedKycItem) => (savedKycItem.id === editingKycId ? kyc : savedKycItem))
      : [kyc, ...existingKycs];

    window.localStorage.setItem(savedKycStorageKey, JSON.stringify(nextKycs));
    setSavedKyc(kyc);
    setActiveStep("complete");
  };

  const createAnotherKyc = () => {
    setKycName("");
    setKycDescription("");
    setSelectedGroups([]);
    setSelectedFieldIds([]);
    setCustomFields([]);
    setCustomFieldGroups([]);
    setGroupCustomFields({});
    setEditedFields({});
    setCurrentConfigGroupIndex(0);
    setSavedKyc(null);
    setEditingKycId(null);
    setActiveStep("groups");
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--brand-background)]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-navbar)] px-8">
        <h1 className="text-[25px] font-bold leading-none text-[var(--brand-text)]">
          {editingKycId ? "Edit KYC" : "Create New KYC"}
        </h1>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-lg leading-none text-gray-500">
          <span>Home</span>
          <span aria-hidden="true">&gt;</span>
          <span>Settings</span>
          <span aria-hidden="true">&gt;</span>
          <span>My KYC</span>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-500">{editingKycId ? "Edit" : "Create"}</span>
        </nav>
      </div>

      {activeStep === "complete" ? (
        <KYCCompleteScreen savedKyc={savedKyc} onCreateAnother={createAnotherKyc} isEditing={Boolean(editingKycId)} />
      ) : activeStep === "groups" ? (
        <>
          <div className="grid grid-cols-1 gap-6 px-8 pb-6 pt-5 lg:grid-cols-2">
            <label className="flex flex-col gap-3 text-lg font-semibold text-[var(--brand-text)]">
              KYC name
              <input
                type="text"
                value={kycName}
                onChange={(event) => {
                  setKycName(event.target.value);
                  if (event.target.value.trim()) setShowKycNameError(false);
                }}
                placeholder="Enter KYC name"
                className={`h-[64px] rounded-md border-2 bg-[var(--brand-navbar)] px-5 text-xl font-normal text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-primary)] ${
                  showKycNameError ? "border-[#d11f3f]" : "border-[var(--brand-border)]"
                }`}
              />
              {!kycName.trim() && (
                <span className="text-sm font-semibold text-[#d11f3f]">KYC name is required.</span>
              )}
            </label>

            <label className="flex flex-col gap-3 text-lg font-semibold text-[var(--brand-text)]">
              Description
              <input
                type="text"
                value={kycDescription}
                onChange={(event) => setKycDescription(event.target.value)}
                placeholder="Add a short description"
                className="h-[64px] rounded-md border-2 border-[var(--brand-border)] bg-[var(--brand-navbar)] px-5 text-xl font-normal text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-primary)]"
              />
            </label>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 px-8 pb-6 lg:grid-cols-2">
            <section className="flex min-h-0 flex-col overflow-hidden border-r border-[var(--brand-border)]">
          <div className="shrink-0 pb-5 pr-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-[var(--brand-text)]">Available pages</h2>

              <div className="flex min-w-0 items-center gap-3">
                <label className="flex h-11 w-[220px] min-w-0 items-center gap-2 rounded-md border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 text-[var(--brand-text-secondary)] transition-colors focus-within:border-[var(--brand-primary)]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input
                    type="search"
                    value={availableFieldSearch}
                    onChange={(event) => setAvailableFieldSearch(event.target.value)}
                    placeholder="Search"
                    className="h-full min-w-0 flex-1 bg-transparent text-base font-normal text-[var(--brand-text)] outline-none placeholder:text-[var(--brand-text-secondary)]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setCustomFieldTargetGroupTitle(null);
                    setIsCustomFieldModalOpen(true);
                  }}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-5 text-base font-semibold text-white shadow-sm transition-colors hover:brightness-95"
                >
                  <Plus className="h-5 w-5" />
                  Create
                </button>
              </div>
            </div>
          </div>
          <div className="min-h-0 w-full max-w-full flex-1 space-y-3 overflow-y-auto pr-2">
            {visibleAvailableGroups.map((group) => {
              const isSelected = selectedGroups.includes(group.title);
              const isComingSoon = Boolean(group.comingSoon);

              return (
                <div
                  key={group.title}
                  draggable={!isSelected && !isComingSoon}
                  onDragStart={(event) => handleDragStart(event, group.title)}
                  title={isComingSoon ? "Coming Soon" : undefined}
                  className={`group relative flex min-h-[104px] w-full max-w-full items-center gap-4 rounded-md border px-5 py-4 shadow-sm transition-colors ${
                    isSelected || isComingSoon
                      ? "cursor-not-allowed border-[var(--brand-border)] opacity-45"
                      : "cursor-grab border-[var(--brand-border)] hover:border-[var(--brand-primary)] active:cursor-grabbing"
                  } ${isComingSoon ? "bg-[#eef1f5] grayscale" : "bg-[var(--brand-navbar)]"}`}
                >
                  <GripVertical className="h-7 w-7 shrink-0 text-[var(--brand-text-secondary)]" />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="truncate text-xl font-semibold text-[var(--brand-text)]">{group.title}</div>
                      {isComingSoon && (
                        <span className="shrink-0 rounded-full bg-[#d7dde6] px-2.5 py-1 text-xs font-bold text-[#64748b]">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-lg text-[var(--brand-text-secondary)]">
                      {group.fields.length} fields
                    </div>
                    <div className="mt-2 truncate text-sm text-[var(--brand-text-secondary)]">
                      {group.fields.slice(0, 3).map((field) => field.label).join(", ")}
                      {group.fields.length > 3 ? "..." : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    draggable={false}
                    onClick={() => addGroup(group.title)}
                    onMouseDown={(event) => event.stopPropagation()}
                    disabled={isSelected || isComingSoon}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] transition-colors hover:border-[var(--brand-primary)] hover:bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[var(--brand-border)] disabled:hover:bg-transparent"
                    aria-label={isComingSoon ? `${group.title} coming soon` : `Add ${group.title}`}
                    title={isComingSoon ? "Coming Soon" : `Add ${group.title}`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  {isComingSoon && (
                    <span className="pointer-events-none absolute right-4 top-3 hidden rounded-md bg-[#111827] px-2.5 py-1 text-xs font-bold text-white shadow-lg group-hover:inline-flex">
                      Coming Soon
                    </span>
                  )}
                </div>
              );
            })}
            {visibleAvailableGroups.length === 0 && (
              <div className="flex min-h-[180px] items-center justify-center rounded-md border border-dashed border-[var(--brand-border)] bg-[var(--brand-navbar)] px-6 text-center text-lg font-medium text-[var(--brand-text-secondary)]">
                No pages found
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 w-full max-w-full flex-col overflow-hidden">
          <div className="shrink-0 border-b border-[var(--brand-border)]">
            <div className="inline-flex h-14 items-center border-b-2 border-[var(--brand-primary)] px-1 text-2xl font-bold text-[var(--brand-text)]">
              Your Selected Pages
            </div>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={`mt-5 flex min-h-0 flex-1 flex-col rounded-md border-4 border-dashed border-[#8F40D4] bg-[#8F40D4]/[0.04] p-5 shadow-[inset_0_0_0_3px_rgba(143,64,212,0.28)] transition-colors ${
              isDraggingOver
                ? "bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)]"
                : ""
            }`}
          >
            {selectedGroups.length === 0 ? (
              <div className="flex min-h-[280px] flex-1 items-center justify-center text-center text-xl font-medium text-[var(--brand-text-secondary)]">
                Drop pages here
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2">
                {selectedGroupDetails.map((group, index) => (
                  <div
                    key={group.title}
                    draggable
                    onDragStart={(event) => handleSelectedDragStart(event, group.title)}
                    onDragEnd={() => setDraggedSelectedGroupTitle(null)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      event.dataTransfer.dropEffect = event.dataTransfer.types.includes(
                        "application/x-kyc-selected-group"
                      )
                        ? "move"
                        : "copy";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const movedGroupTitle = event.dataTransfer.getData("application/x-kyc-selected-group");
                      if (movedGroupTitle) {
                        moveSelectedGroup(movedGroupTitle, group.title);
                      } else {
                        addGroup(event.dataTransfer.getData("text/plain"));
                      }
                      setDraggedSelectedGroupTitle(null);
                    }}
                    className={`flex h-[76px] cursor-grab items-center gap-4 rounded-md border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-5 shadow-sm transition-opacity active:cursor-grabbing ${
                      draggedSelectedGroupTitle === group.title ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <GripVertical className="h-6 w-6 shrink-0 text-[var(--brand-text-secondary)]" />
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-base font-bold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate text-lg font-semibold text-[var(--brand-text)]">{group.title}</div>
                      <div className="truncate text-base text-[var(--brand-text-secondary)]">
                        {group.fields.length} fields
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGroup(group.title)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] text-[#d11f3f] transition-colors hover:bg-[#fff1f3]"
                      aria-label={`Remove ${group.title}`}
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
          </div>
        </>
      ) : (
        <KYCFieldConfigurationPage
          selectedGroups={selectedGroupDetails}
          currentGroup={currentConfigGroup}
          currentGroupIndex={currentConfigGroupIndex}
          selectedFieldIds={selectedFieldIds}
          selectedPreviewFields={currentPreviewFields}
          onToggleField={toggleField}
          onSelectGroupStep={setCurrentConfigGroupIndex}
          onCreateField={() => {
            setCustomFieldTargetGroupTitle(currentConfigGroup.title);
            setFieldBeingEdited(null);
            setIsCustomFieldModalOpen(true);
          }}
          onEditField={(field) => {
            setCustomFieldTargetGroupTitle(currentConfigGroup.title);
            setFieldBeingEdited(field);
            setIsCustomFieldModalOpen(true);
          }}
        />
      )}

      {activeStep !== "complete" && (
        <footer className="flex h-24 shrink-0 items-center justify-end border-t border-[var(--brand-border)] bg-[var(--brand-navbar)] px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToPreviousStep}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-md border border-[var(--brand-border)] bg-transparent px-8 text-xl font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-background)]"
            >
              <ArrowLeft className="h-6 w-6" />
              Prev
            </button>

            <button
              type="button"
              onClick={goToNextStep}
              disabled={activeStep === "groups" && selectedGroups.length === 0}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-9 text-xl font-semibold text-white shadow-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {activeStep === "groups"
                ? "Start"
                : currentConfigGroupIndex < selectedGroupDetails.length - 1
                  ? "Next"
                  : "Finish"}
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </footer>
      )}

      {isCustomFieldModalOpen && (
        <CustomFieldModal
          mode={fieldBeingEdited ? "edit" : customFieldTargetGroupTitle ? "fields" : "group"}
          initialFields={fieldBeingEdited ? [fieldBeingEdited] : []}
          onClose={() => {
            setIsCustomFieldModalOpen(false);
            setCustomFieldTargetGroupTitle(null);
            setFieldBeingEdited(null);
          }}
          onSave={(fields, pageTitle, pageDescription) =>
            fieldBeingEdited
              ? saveEditedField(fields[0])
              : customFieldTargetGroupTitle
              ? saveFieldsToGroup(fields, customFieldTargetGroupTitle)
              : saveCustomFieldGroup(fields, pageTitle, pageDescription)
          }
          key={fieldBeingEdited?.id || customFieldTargetGroupTitle || "global-custom-fields"}
        />
      )}
    </div>
  );
}

function KYCCompleteScreen({ savedKyc, onCreateAnother, isEditing }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 py-10">
      <section className="w-full max-w-2xl rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ecfdf5] text-[#047857]">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-3xl font-bold text-[var(--brand-text)]">
          {isEditing ? "KYC updated" : "KYC saved"}
        </h2>
        <p className="mt-3 text-lg text-[var(--brand-text-secondary)]">
          {savedKyc?.name || "Your KYC"} has been {isEditing ? "updated" : "created and added to My KYC"}.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/neuro-access/settings/my-kyc"
            className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-7 text-lg font-semibold text-white shadow-sm transition-colors hover:brightness-95"
          >
            View My KYC
          </Link>
          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex h-12 items-center justify-center rounded-md border border-[var(--brand-border)] bg-transparent px-7 text-lg font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-background)]"
          >
            Create another
          </button>
        </div>
      </section>
    </div>
  );
}

function KYCFieldConfigurationPage({
  selectedGroups,
  currentGroup,
  currentGroupIndex,
  selectedFieldIds,
  selectedPreviewFields,
  onToggleField,
  onSelectGroupStep,
  onCreateField,
  onEditField,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pb-6 pt-5">
      <KYCGroupProgress
        groups={selectedGroups}
        currentGroupIndex={currentGroupIndex}
        onSelectGroupStep={onSelectGroupStep}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 overflow-hidden lg:grid-cols-[minmax(300px,0.76fr)_minmax(560px,1.24fr)]">
        <section className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-4 pb-5">
            <h2 className="text-2xl font-bold text-[var(--brand-text)]">{currentGroup?.title}</h2>
            <button
              type="button"
              onClick={onCreateField}
              disabled={!currentGroup}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-5 text-base font-semibold text-white shadow-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Plus className="h-5 w-5" />
              Create field
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-2">
            {currentGroup && (
              <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-4 border-b border-[var(--brand-border)] pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--brand-text)]">{currentGroup.title}</h3>
                    {currentGroup.description && (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--brand-text-secondary)]">
                        {currentGroup.description}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] px-3 py-1 text-sm font-bold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]">
                    {currentGroupIndex + 1} / {selectedGroups.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {currentGroup.fields.map((field) => {
                    const isIncluded = selectedFieldIds.includes(field.id);

                    return (
                      <div
                        key={field.id}
                        className="flex items-center gap-4 rounded-md border border-[var(--brand-border)] bg-white px-4 py-3 transition-colors hover:border-[var(--brand-primary)]"
                      >
                        <input
                          type="checkbox"
                          checked={isIncluded}
                          onChange={() => onToggleField(field.id)}
                          className="h-5 w-5 accent-[var(--brand-primary)]"
                          aria-label={`Include ${field.label}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-base font-semibold text-[var(--brand-text)]">
                            {field.label}
                          </div>
                          <div className="truncate text-sm text-[var(--brand-text-secondary)]">{field.type}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEditField(field)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] text-[var(--brand-text-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                          aria-label={`Edit ${field.label}`}
                          title="Edit field"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        <KYCFlowPreview group={currentGroup} selectedPreviewFields={selectedPreviewFields} />
      </div>
    </div>
  );
}

function KYCGroupProgress({ groups, currentGroupIndex, onSelectGroupStep }) {
  const progressWidth =
    groups.length > 1 ? `${(currentGroupIndex / (groups.length - 1)) * 100}%` : "100%";

  return (
    <div className="mb-6 shrink-0 rounded-lg bg-[#f4f7fb] px-6 py-4">
      <div className="relative">
        <div className="absolute left-4 right-4 top-[18px] h-1 rounded-full bg-[#cfd8ee]" />
        <div
          className="absolute left-4 top-[18px] h-1 rounded-full bg-[#2f67dc] transition-all"
          style={{ width: `calc((100% - 32px) * ${parseFloat(progressWidth) / 100})` }}
        />

        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}>
        {groups.map((group, index) => {
          const isActive = index === currentGroupIndex;
          const isComplete = index < currentGroupIndex;

          return (
            <button
              key={group.title}
              type="button"
              onClick={() => onSelectGroupStep(index)}
              className="group min-w-0 text-left"
            >
              <div className="relative mb-2 flex h-10 items-center">
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
                    isActive || isComplete
                      ? "border-[#2f67dc] text-[#2f67dc]"
                      : "border-[#d8dde7] text-[#64748b] group-hover:border-[#2f67dc]"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                {isComplete && (
                  <span className="absolute left-5 top-0 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-[#35c78a] text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div
                className={`truncate text-sm ${
                  isActive ? "font-bold text-[#1f2a44]" : "font-medium text-[#344256]"
                }`}
              >
                {group.title}
              </div>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function KYCFlowPreview({ group, selectedPreviewFields }) {
  const visibleFields = group?.fields.filter((field) =>
    selectedPreviewFields.some((selectedField) => selectedField.id === field.id)
  ) || [];
  const previewTitle = `${group?.title || "KYC"} preview`;

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden bg-transparent">
      <h2 className="mb-4 flex shrink-0 items-center gap-3 text-lg font-bold text-[#111827]">
        <span className="h-5 w-1 rounded-full bg-[#111827]" />
        {previewTitle}
      </h2>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-[20px] border border-[#c7d6f5] bg-[#e9effb] p-2.5 shadow-[inset_0_0_0_1px_rgba(143,64,212,0.08)]">
        <div className="mx-auto min-h-full max-w-[960px] overflow-hidden rounded-[14px] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
          <div className="flex h-11 items-center gap-3 border-b border-[#d7dde7] bg-[#e7ebf2] px-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            </div>
            <div className="flex h-7 min-w-0 flex-1 items-center rounded bg-white px-3 text-[11px] text-[#64748b]">
              https://verify.example.com/session/{group?.title.toLowerCase().replaceAll(" ", "-") || "kyc"}
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="mb-5 flex items-center justify-end gap-3">
              <span
                aria-hidden="true"
                className="inline-flex h-9 items-center rounded-md border border-[#e5e9f0] bg-white px-3 text-xs font-semibold text-[#64748b]"
              >
                En
              </span>
              <span
                aria-hidden="true"
                className="inline-flex h-9 items-center rounded-md border border-[#e5e9f0] bg-white px-3 text-xs font-semibold text-[#64748b]"
              >
                Help
              </span>
            </div>

            <div className="mx-auto max-w-[760px]">
              <div className="mb-6 text-center">
                <h3 className="text-[26px] font-bold leading-tight text-[#151b23]">{group?.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748b]">
                  {group?.description || "Complete this page to continue your verification."}
                </p>
              </div>

              <div className="rounded-lg border border-[#e5e9f0] bg-white p-6 shadow-sm">
                {selectedPreviewFields.length === 0 ? (
                  <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-[#c7ced9] bg-[#f8fafc] px-6 text-center text-base font-medium text-[#64748b]">
                    Select fields on the left to build the customer view.
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {visibleFields.map((field) => (
                        <KYCPreviewField key={field.id} field={field} />
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end border-t border-[#e5e9f0] pt-4">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-11 items-center rounded-md bg-[#8F40D4] px-6 text-sm font-bold text-white shadow-sm"
                      >
                        Continue
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function KYCPreviewField({ field }) {
  const visibleOptions = field.options?.filter((option) => option.value.trim()) || [];

  if (field.kind === "group") {
    return (
      <div className="xl:col-span-2">
        <div className="mb-3">
          <div className="text-sm font-semibold text-[#151b23]">{field.label}</div>
          {field.description && <p className="mt-1 text-sm text-[#64748b]">{field.description}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {field.subfields.map((subfield) => (
            <label key={subfield.id} className="block">
              <span className="mb-2 block text-sm font-semibold text-[#151b23]">
                {subfield.label || "Subfield"}
              </span>
              <div className="flex h-12 items-center rounded-md border border-[#d8dde7] bg-[#f8fafc] px-3.5 text-sm text-[#64748b]">
                {subfield.placeholder || "Enter details"}
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  const placeholderByType = {
    Date: "DD / MM / YYYY",
    Email: "name@example.com",
    Phone: "+46 70 000 00 00",
    Number: "0",
    Select: "Select an option",
    Verification: "Verification step",
    "File upload": "Upload file",
    "Text input": "Enter details",
  };
  const placeholder = field.placeholder || placeholderByType[field.type] || "Enter details";

  if (field.type === "Radio" || field.inputType === "radio") {
    return (
      <div className="xl:col-span-2">
        <div className="mb-2 text-sm font-semibold text-[#151b23]">{field.label}</div>
        <div className="grid grid-cols-2 gap-2">
          {(visibleOptions.length ? visibleOptions : [{ id: "preview-radio-1", value: "Option" }]).map((option) => (
            <div
              key={option.id}
              className="flex h-11 items-center gap-2 rounded-md border border-[#d8dde7] px-3"
            >
              <span className="h-4 w-4 rounded-full border-2 border-[#9aa4b2]" />
              <span className="text-sm text-[#151b23]/65">{option.value.trim() || "Option"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "Checkboxes" || field.inputType === "checkboxes") {
    return (
      <div className="xl:col-span-2">
        <div className="mb-2 text-sm font-semibold text-[#151b23]">{field.label}</div>
        <div className="grid grid-cols-2 gap-2">
          {(visibleOptions.length ? visibleOptions : [{ id: "preview-checkbox-1", value: "Option" }]).map(
            (option) => (
              <div
                key={option.id}
                className="flex h-11 items-center gap-2 rounded-md border border-[#d8dde7] px-3"
              >
                <span className="h-4 w-4 rounded border-2 border-[#9aa4b2]" />
                <span className="text-sm text-[#151b23]/65">{option.value.trim() || "Option"}</span>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (field.type === "File upload" || field.type === "Verification") {
    return (
      <div className="xl:col-span-2">
        <div className="mb-2 text-sm font-semibold text-[#151b23]">{field.label}</div>
        <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-[#b8c1cf] bg-[#f8fafc] text-sm font-semibold text-[#64748b]">
          {placeholder}
        </div>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#151b23]">{field.label}</span>
      <div className="flex h-12 items-center rounded-md border border-[#d8dde7] bg-[#f8fafc] px-3.5 text-sm text-[#64748b]">
        {placeholder}
      </div>
    </label>
  );
}

function CustomFieldModal({ mode = "fields", initialFields, onClose, onSave }) {
  const [fields, setFields] = useState(() =>
    initialFields.length
      ? initialFields.map((field) => ({
          ...field,
          kind: field.kind || "field",
          description: field.description || "",
          hint: field.hint || "",
          subfields: (field.subfields || []).map((subfield) => ({ ...subfield })),
          options: field.options?.length
            ? field.options.map((option) => ({ ...option }))
            : [{ id: `option-${Date.now()}`, value: "" }],
        }))
      : [createEmptyCustomField()]
  );
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [openInputTypeFieldId, setOpenInputTypeFieldId] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const isPageMode = mode === "group";
  const isEditMode = mode === "edit";

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateField = (fieldId, updates) => {
    setFields((current) =>
      current.map((field) => (field.id === fieldId ? { ...field, ...updates } : field))
    );
  };

  const updateSubfield = (fieldId, subfieldId, updates) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              subfields: field.subfields.map((subfield) =>
                subfield.id === subfieldId ? { ...subfield, ...updates } : subfield
              ),
            }
          : field
      )
    );
  };

  const addSubfield = (fieldId) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              subfields: [
                ...field.subfields,
                {
                  id: `subfield-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  label: "",
                  placeholder: "",
                  required: false,
                },
              ],
            }
          : field
      )
    );
  };

  const removeSubfield = (fieldId, subfieldId) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId && field.subfields.length > 1
          ? { ...field, subfields: field.subfields.filter((subfield) => subfield.id !== subfieldId) }
          : field
      )
    );
  };

  const addAnswerOption = (fieldId) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: [
                ...field.options,
                { id: `option-${Date.now()}-${Math.random().toString(36).slice(2)}`, value: "" },
              ],
            }
          : field
      )
    );
  };

  const updateAnswerOption = (fieldId, optionId, value) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: field.options.map((option) =>
                option.id === optionId ? { ...option, value } : option
              ),
            }
          : field
      )
    );
  };

  const removeAnswerOption = (fieldId, optionId) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId && field.options.length > 1
          ? { ...field, options: field.options.filter((option) => option.id !== optionId) }
          : field
      )
    );
  };

  const canSave = fields.every(
    (field) =>
      field.label.trim() &&
      (field.kind === "group"
        ? field.subfields.length > 0 && field.subfields.every((subfield) => subfield.label.trim())
        : (field.inputType || field.type) &&
          (!usesAnswerOptions(field) ||
            field.options.every((option) => option.value.trim())))
  ) && (!isPageMode || pageTitle.trim());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-8">
      <button
        type="button"
        aria-label="Close custom field modal"
        className="absolute inset-0 h-full w-full bg-black/35 backdrop-blur-md"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-field-modal-title"
        className="relative z-10 flex max-h-[calc(100vh-64px)] w-full max-w-[1180px] flex-col overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[#f8f9fb] shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-6 border-b border-[#e3e7ee] px-7 py-6">
          <div>
            <h2 id="custom-field-modal-title" className="text-[30px] font-bold leading-tight text-[#181f25]">
              {isEditMode ? "Edit Field" : isPageMode ? "Create Custom Page" : "Create Page Fields"}
            </h2>
            <p className="mt-2 text-base text-[#181f25]/70">
              {isEditMode
                ? "Update this field directly inside the page configuration."
                : isPageMode
                ? "Name the page, describe it, then add the fields that belong inside it."
                : "Add fields directly into the page you are configuring."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#d1d7e0] bg-white text-[#181f25]/70 transition-colors hover:bg-[#eef0f3]"
            aria-label="Close custom fields"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden px-7 py-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-[#181f25]">Classic configuration</h3>
              <p className="mt-1 text-sm text-[#181f25]/60">
                {isEditMode
                  ? "Adjust the field label, input behavior, answers, hint text, and required status."
                  : isPageMode
                  ? "A custom KYC page is made from one or more fields."
                  : "Build the field details and answer behavior."}
              </p>
            </div>

          {isPageMode && (
            <div className="mb-5 space-y-3">
              <input
                type="text"
                value={pageTitle}
                onChange={(event) => setPageTitle(event.target.value)}
                placeholder="Add custom page title"
                className="h-[52px] w-full rounded-md border border-[#d1d7e0] bg-white px-4 text-[20px] font-semibold text-[#181f25] outline-none transition-colors placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
              />
              <textarea
                value={pageDescription}
                onChange={(event) => setPageDescription(event.target.value)}
                placeholder="Add page description"
                rows={3}
                className="min-h-[92px] w-full resize-none rounded-md border border-[#d1d7e0] bg-white px-4 py-3 text-[17px] text-[#181f25] outline-none transition-colors placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
              />
            </div>
          )}

          {showInfo && (
            <div className="mb-5 flex items-start gap-3 rounded-md bg-[#d8e5f6] px-4 py-4 text-[#155da8]">
              <Info className="mt-0.5 h-6 w-6 shrink-0" />
              <p className="flex-1 text-base leading-snug">
                {isEditMode
                  ? "Changes will update this field wherever it appears in this KYC."
                  : isPageMode
                  ? "Custom pages appear beside the default pages and can be dragged into your KYC."
                  : "Saved fields will be added directly into this page and selected automatically."}
              </p>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="rounded p-1 transition-colors hover:bg-white/35"
                aria-label="Dismiss custom fields information"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex gap-3 rounded-md border border-[#d7dde6] bg-white px-4 py-5 shadow-[inset_0_0_0_1px_rgba(24,31,37,0.04)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#f3f4f6] text-[#181f25]/60">
                  <GripVertical className="h-[22px] w-[22px]" />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(event) => updateField(field.id, { label: event.target.value })}
                    placeholder={field.kind === "group" ? "Add Page Field Label" : "Add Field Label"}
                    className="h-12 w-full rounded-md border border-[#d1d7e0] bg-white px-3.5 text-[18px] text-[#181f25] outline-none transition-colors placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                  />

                  {field.kind === "group" ? (
                    <div>
                      <div className="mb-2 text-base font-semibold text-[#181f25]/60">Fields in this page item</div>
                      <div className="space-y-2">
                        {field.subfields.map((subfield) => (
                          <div key={subfield.id} className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={subfield.label}
                              onChange={(event) =>
                                updateSubfield(field.id, subfield.id, { label: event.target.value })
                              }
                              placeholder="Subfield label"
                              className="h-12 min-w-0 rounded-md border border-[#d1d7e0] bg-white px-3.5 text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                            />
                            <div className="relative">
                              <input
                                type="text"
                                value={subfield.placeholder}
                                onChange={(event) =>
                                  updateSubfield(field.id, subfield.id, { placeholder: event.target.value })
                                }
                                placeholder="Placeholder"
                                className="h-12 w-full min-w-0 rounded-md border border-[#d1d7e0] bg-white px-3.5 pr-12 text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                              />
                              <button
                                type="button"
                                onClick={() => removeSubfield(field.id, subfield.id)}
                                disabled={field.subfields.length <= 1}
                                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[26px] font-bold leading-none text-[#d11f3f] transition-colors hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-35"
                                aria-label="Remove subfield"
                              >
                                -
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addSubfield(field.id)}
                        className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#d1d7e0] text-[18px] font-medium text-[#181f25]/60 transition-colors hover:border-[var(--brand-primary)] hover:bg-[#f3f4f6]"
                      >
                        <Plus className="h-[22px] w-[22px]" />
                        Add subfield
                      </button>
                    </div>
                  ) : (
                    <>
                  <div className="relative z-20">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenInputTypeFieldId((current) => (current === field.id ? null : field.id))
                      }
                      className="flex h-12 w-full items-center justify-between rounded-md border border-[#d1d7e0] bg-white px-3.5 text-left text-[18px] text-[#181f25]/70 transition-colors hover:border-[var(--brand-primary)]"
                      aria-haspopup="listbox"
                      aria-expanded={openInputTypeFieldId === field.id}
                    >
                      <span>
                        {inputTypeOptions.find((option) => option.value === field.inputType)?.label ||
                          "Choose Input Type"}
                      </span>
                      <ChevronDown
                        className={`h-[22px] w-[22px] transition-transform ${
                          openInputTypeFieldId === field.id ? "rotate-180" : ""
                        }`}
                      />
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
                            onClick={() => {
                              updateField(field.id, { inputType: option.value });
                              setOpenInputTypeFieldId(null);
                            }}
                            className={`block w-full px-3.5 py-3 text-left text-[18px] transition-colors ${
                              field.inputType === option.value
                                ? "bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]"
                                : "text-[#181f25]/70 hover:bg-[#f3f4f6]"
                            }`}
                            role="option"
                            aria-selected={field.inputType === option.value}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {field.inputType === "text" && (
                    <div>
                      <div className="mb-2 text-base font-semibold text-[#181f25]/60">Placeholder</div>
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
                        placeholder="Edit placeholder"
                        className="h-12 w-full rounded-md border border-[#d1d7e0] bg-white px-3.5 text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                      />
                    </div>
                  )}

                  {usesAnswerOptions(field) && (
                    <div>
                      <div className="mb-2 text-base font-semibold text-[#181f25]/60">Answer Options</div>
                      <div className="space-y-2">
                        {field.options.map((option) => (
                          <div key={option.id} className="relative">
                            <input
                              type="text"
                              value={option.value}
                              onChange={(event) =>
                                updateAnswerOption(field.id, option.id, event.target.value)
                              }
                              placeholder="Edit answer"
                              className="h-12 w-full min-w-0 rounded-md border border-[#d1d7e0] bg-white px-3.5 pr-12 text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                            />
                            <button
                              type="button"
                              onClick={() => removeAnswerOption(field.id, option.id)}
                              disabled={field.options.length <= 1}
                              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[26px] font-bold leading-none text-[#d11f3f] transition-colors hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-35"
                              aria-label="Remove answer option"
                            >
                              -
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addAnswerOption(field.id)}
                        className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#d1d7e0] text-[18px] font-medium text-[#181f25]/60 transition-colors hover:border-[var(--brand-primary)] hover:bg-[#f3f4f6]"
                      >
                        <Plus className="h-[22px] w-[22px]" />
                        Add option
                      </button>
                    </div>
                  )}
                    </>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={field.hint}
                      onChange={(event) => updateField(field.id, { hint: event.target.value })}
                      placeholder="Add hint text"
                      className="h-12 w-full rounded-md border border-[#d1d7e0] bg-white px-3.5 pr-11 text-[18px] text-[#181f25] outline-none transition-colors placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                    />
                    <span
                      className="absolute right-3 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#eef2ff] text-[#722FAD]"
                      aria-label="Hint text is used by screen readers"
                      title="Hint text is used by screen readers"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex h-11 cursor-pointer items-center gap-3 rounded-md border border-[#d1d7e0] px-3.5 text-base font-medium text-[#181f25]">
                      Required
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={() => updateField(field.id, { required: !field.required })}
                        className="sr-only"
                      />
                      <span
                        className={`relative h-5 w-9 rounded-full border transition-colors ${
                          field.required
                            ? "border-[#29BF86] bg-[#29BF86]"
                            : "border-[#181f25]/50 bg-white"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-transform ${
                            field.required ? "translate-x-4 bg-white" : "bg-[#181f25]/70"
                          }`}
                        />
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setFields((current) =>
                          current.length > 1
                            ? current.filter((currentField) => currentField.id !== field.id)
                            : current
                        )
                      }
                      disabled={fields.length <= 1}
                      className="flex h-11 w-11 items-center justify-center rounded-md border border-[#d1d7e0] text-[#d11f3f] transition-colors hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Remove custom field"
                    >
                      <Trash2 className="h-[22px] w-[22px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isEditMode && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setFields((current) => [...current, createEmptyCustomField()])}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[18px] font-semibold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] transition-colors hover:brightness-95"
              >
                <Plus className="h-[22px] w-[22px]" />
                Add field to page
              </button>
            </div>
          )}
          </div>

          <aside className="min-h-0 overflow-y-auto rounded-lg border border-[#d7dde6] bg-white p-5">
            <div className="mb-5 border-b border-[#e3e7ee] pb-4">
              <h3 className="text-xl font-bold text-[#181f25]">Live preview</h3>
              <p className="mt-1 text-sm text-[#181f25]/60">
                {isPageMode
                  ? `How ${pageTitle.trim() || "this custom page"} will appear to the user.`
                  : "How these fields will appear to the user."}
              </p>
            </div>

            {isPageMode && (
              <div className="mb-5 rounded-lg border border-[#d7dde6] bg-[#fbfcfd] p-4">
                <h4 className="text-2xl font-bold text-[#181f25]">{pageTitle.trim() || "Page title"}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#181f25]/65">
                  {pageDescription.trim() || "Page description will appear here."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {fields.map((field) => (
                <CustomFieldPreview key={field.id} field={field} />
              ))}
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e3e7ee] bg-white px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-md border border-[#d1d7e0] bg-white px-6 text-[18px] font-semibold text-[#181f25] transition-colors hover:bg-[#f3f4f6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(fields, pageTitle, pageDescription)}
            disabled={!canSave}
            className="h-12 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-7 text-[18px] font-bold text-white shadow-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isEditMode ? "Save Field" : isPageMode ? "Save Page" : "Save Fields"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function CustomFieldPreview({ field }) {
  const label = field.label?.trim() || "Field label";
  const hint = field.hint?.trim() || "";
  const placeholder = field.placeholder?.trim() || "Enter answer";
  const visibleOptions = field.options?.filter((option) => option.value.trim()) || [];

  if (field.kind === "group") {
    return (
      <div className="rounded-md border border-[#d7dde6] bg-[#fbfcfd] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="block text-base font-bold text-[#181f25]">{label}</div>
          </div>
          <span className="shrink-0 rounded-full bg-[#eef0f3] px-2.5 py-1 text-xs font-semibold text-[#181f25]/55">
            Page item
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(field.subfields || []).map((subfield) => (
            <div key={subfield.id}>
              <div className="mb-1.5 text-sm font-semibold text-[#181f25]/70">
                {subfield.label || "Subfield label"}
              </div>
              <div className="flex h-11 items-center rounded-md border border-[#d1d7e0] bg-white px-3 text-sm text-[#181f25]/45">
                {subfield.placeholder || "Enter answer"}
              </div>
            </div>
          ))}
        </div>
        {hint && <p className="mt-3 text-sm leading-snug text-[#181f25]/55">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#d7dde6] bg-[#fbfcfd] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label className="block text-base font-bold text-[#181f25]">
            {label}
            {field.required && <span className="ml-1 text-[#d11f3f]">*</span>}
          </label>
        </div>
        <span className="shrink-0 rounded-full bg-[#eef0f3] px-2.5 py-1 text-xs font-semibold text-[#181f25]/55">
          {inputTypeOptions.find((option) => option.value === field.inputType)?.label || "Type"}
        </span>
      </div>

      <div className="mt-4">
        {(field.inputType === "radio" || field.type === "Radio") && (
          <div className="space-y-2">
            {(visibleOptions.length ? visibleOptions : [{ id: "preview-radio", value: "Option" }]).map(
              (option) => (
                <label key={option.id} className="flex items-center gap-3 text-sm font-medium text-[#181f25]/75">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#b9c1cc] bg-white">
                    <span className="h-2 w-2 rounded-full bg-transparent" />
                  </span>
                  {option.value.trim() || "Option"}
                </label>
              )
            )}
          </div>
        )}

        {(field.inputType === "checkboxes" || field.type === "Checkboxes") && (
          <div className="space-y-2">
            {(visibleOptions.length ? visibleOptions : [{ id: "preview-checkbox", value: "Option" }]).map(
              (option) => (
                <label key={option.id} className="flex items-center gap-3 text-sm font-medium text-[#181f25]/75">
                  <span className="h-5 w-5 shrink-0 rounded border-2 border-[#b9c1cc] bg-white" />
                  {option.value.trim() || "Option"}
                </label>
              )
            )}
          </div>
        )}

        {!usesAnswerOptions(field) && (
          <div className="flex h-12 items-center rounded-md border border-[#d1d7e0] bg-white px-3.5 text-base text-[#181f25]/45">
            {field.inputType === "text" ? placeholder : "Choose input type"}
          </div>
        )}
      </div>

      {hint && <p className="mt-3 text-sm leading-snug text-[#181f25]/55">{hint}</p>}
    </div>
  );
}
