"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiLoader, FiRefreshCw, FiTrash2, FiUserPlus, FiUsers } from "react-icons/fi";
import {
  createIssuer,
  createIssuerLocalization,
  listIssuerLocalizations,
  updateIssuerLocalization,
  uploadIssuerProfilePhoto,
} from "@/lib/projectAdmin";

const parseApiArray = (payload) => {
  const candidates = [
    payload,
    payload?.data,
    payload?.data?.data,
    payload?.data?.items,
    payload?.data?.results,
    payload?.results,
    payload?.items,
  ];
  const found = candidates.find((item) => Array.isArray(item));

  if (Array.isArray(found)) return found;

  const objectData = payload?.data;
  if (objectData && typeof objectData === "object" && !Array.isArray(objectData)) {
    const objectValues = Object.values(objectData).filter((value) => value && typeof value === "object");
    if (objectValues.length > 0) return objectValues;
  }

  return [];
};

const extractErrorCode = (payload) => {
  const message = String(payload?.message || payload?.error || "");
  const directCode = String(payload?.error_code || payload?.data?.error_code || "").toLowerCase();
  if (directCode) return directCode;

  if (/resource_already_exists/i.test(message)) return "resource_already_exists";
  if (/subject_issuer_relation_not_found/i.test(message)) return "subject_issuer_relation_not_found";
  if (/missing_field/i.test(message)) return "missing_field";
  if (/invalid_field/i.test(message)) return "invalid_field";
  return "";
};

const isValidUsername = (value) => /^[^@\s]+$/.test(String(value || "").trim());
const USERNAME_PAGE_SIZE = 10;
const EMPTY_ISSUER_LOCALIZATION = {
  name: "",
  about: "",
  location: "",
  industry: "",
};
const EMPTY_ISSUER_FORM = {
  "en-US": { ...EMPTY_ISSUER_LOCALIZATION },
  "pt-PT": { ...EMPTY_ISSUER_LOCALIZATION },
};

export default function IssuerAccountsManager({ initialIssuerId = "" }) {
  const [issuerId, setIssuerId] = useState(String(initialIssuerId || ""));
  const [newUsername, setNewUsername] = useState("");
  const [selectedAccountUsername, setSelectedAccountUsername] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const accountUsernamesRequestRef = useRef(0);

  const [issuerOptions, setIssuerOptions] = useState([]);
  const [accountUsernames, setAccountUsernames] = useState([]);
  const [accountUsernamesPage, setAccountUsernamesPage] = useState(0);
  const [hasMoreAccountUsernames, setHasMoreAccountUsernames] = useState(true);
  const [isLoadingIssuers, setIsLoadingIssuers] = useState(true);
  const [isLoadingAccountUsernames, setIsLoadingAccountUsernames] = useState(true);
  const [isLoadingMoreAccountUsernames, setIsLoadingMoreAccountUsernames] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingIssuerProfile, setIsLoadingIssuerProfile] = useState(false);
  const [isSavingIssuerProfile, setIsSavingIssuerProfile] = useState(false);
  const [isCreatingIssuer, setIsCreatingIssuer] = useState(false);
  const [issuerDraft, setIssuerDraft] = useState(EMPTY_ISSUER_FORM);
  const [issuerLogoUrl, setIssuerLogoUrl] = useState("");
  const [issuerLogoFile, setIssuerLogoFile] = useState(null);
  const [issuerValidationError, setIssuerValidationError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [agentHost, setAgentHost] = useState("AGENT_HOST");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = sessionStorage.getItem("AgentAPI.Host") || "AGENT_HOST";
    setAgentHost(host);
  }, []);

  const subjectSuffix = useMemo(() => `@${agentHost}`, [agentHost]);
  const resolvedSubject = useMemo(() => {
    const cleanUsername = String(newUsername || "").trim();
    return cleanUsername ? `${cleanUsername}${subjectSuffix}` : "";
  }, [newUsername, subjectSuffix]);

  const assignedUsernameSet = useMemo(() => {
    return new Set(
      assignedUsers
        .map((subject) => String(subject || "").trim().split("@")[0])
        .filter(Boolean)
    );
  }, [assignedUsers]);

  const availableAccountUsernames = useMemo(() => {
    return accountUsernames.filter((username) => !assignedUsernameSet.has(username));
  }, [accountUsernames, assignedUsernameSet]);

  const isIssuerActionBusy = isLoadingIssuerProfile || isSavingIssuerProfile || isCreatingIssuer;

  const resolveIssuerAssetUrl = useCallback((rawUrl) => {
    const value = String(rawUrl || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;

    const normalizedAgentHost = String(agentHost || "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const fallbackHost = process.env.NEXT_PUBLIC_AGENT_HOST || process.env.AGENT_HOST || "mateo.lab.tagroot.io";
    const host = normalizedAgentHost && normalizedAgentHost !== "AGENT_HOST"
      ? normalizedAgentHost
      : fallbackHost;

    if (value.startsWith("/nex-resources/")) {
      return `https://${host}${value}`;
    }

    return value.startsWith("/") ? value : `/${value}`;
  }, [agentHost]);

  const resolveIssuerLogoFromLocalization = useCallback((localization) => {
    const candidates = [
      localization?.profile_photo?.url,
      localization?.profilePhoto?.url,
      localization?.issuer_profile_photo?.url,
      localization?.issuerProfilePhoto?.url,
      localization?.image?.url,
      localization?.photo?.url,
      localization?.logo?.url,
      localization?.logo_url,
      localization?.image_url,
      localization?.photo_url,
    ];

    const found = candidates.find((value) => typeof value === "string" && value.trim()) || "";
    return resolveIssuerAssetUrl(found);
  }, [resolveIssuerAssetUrl]);

  const normalizeIssuerDraftForSave = useCallback((draft) => {
    const en = draft?.["en-US"] || EMPTY_ISSUER_LOCALIZATION;
    const pt = draft?.["pt-PT"] || EMPTY_ISSUER_LOCALIZATION;

    const normalizedEn = {
      name: String(en.name || "").trim(),
      about: String(en.about || "").trim(),
      location: String(en.location || "").trim(),
      industry: String(en.industry || "").trim(),
    };

    const pickPt = (key) => {
      const ptValue = String(pt[key] || "").trim();
      return ptValue || normalizedEn[key];
    };

    const normalizedPt = {
      name: pickPt("name"),
      about: pickPt("about"),
      location: pickPt("location"),
      industry: pickPt("industry"),
    };

    return {
      "en-US": normalizedEn,
      "pt-PT": normalizedPt,
    };
  }, []);

  const validateIssuerDraft = useCallback((draft) => {
    const enName = String(draft?.["en-US"]?.name || "").trim();
    const enAbout = String(draft?.["en-US"]?.about || "").trim();
    const enLocation = String(draft?.["en-US"]?.location || "").trim();
    const enIndustry = String(draft?.["en-US"]?.industry || "").trim();

    if (!enName) {
      return "Issuer name (EN) is required.";
    }
    if (enName.length < 5 || enName.length > 40) {
      return "Issuer name (EN) must be between 5 and 40 characters.";
    }
    if (!enAbout) {
      return "Issuer about (EN) is required.";
    }
    if (!enLocation) {
      return "Issuer location (EN) is required.";
    }
    if (!enIndustry) {
      return "Issuer industry (EN) is required.";
    }
    return "";
  }, []);

  const upsertIssuerLocalizations = useCallback(async (targetIssuerId, draft) => {
    const normalized = normalizeIssuerDraftForSave(draft);
    const existingLocalizations = await listIssuerLocalizations(targetIssuerId);
    const existingSet = new Set(
      (Array.isArray(existingLocalizations) ? existingLocalizations : [])
        .map((item) => String(item?.localization || "").trim())
        .filter(Boolean),
    );

    const saveLocalization = async (localization) => {
      const payload = {
        localization,
        ...normalized[localization],
      };

      if (existingSet.has(localization)) {
        await updateIssuerLocalization(targetIssuerId, payload);
      } else {
        await createIssuerLocalization(targetIssuerId, payload);
      }
    };

    await Promise.all([saveLocalization("en-US"), saveLocalization("pt-PT")]);
  }, [normalizeIssuerDraftForSave]);

  const loadIssuerProfile = useCallback(async (nextIssuerId) => {
    const resolvedIssuerId = String(nextIssuerId || "").trim();
    if (!resolvedIssuerId) {
      setIssuerDraft(EMPTY_ISSUER_FORM);
      setIssuerLogoUrl("");
      setIssuerLogoFile(null);
      setIssuerValidationError("");
      return;
    }

    setIsLoadingIssuerProfile(true);
    try {
      const localizations = await listIssuerLocalizations(resolvedIssuerId);
      const rows = Array.isArray(localizations) ? localizations : [];
      const en = rows.find((item) => item?.localization === "en-US") || rows[0] || {};
      const pt = rows.find((item) => item?.localization === "pt-PT") || {};

      const nextDraft = {
        "en-US": {
          name: String(en?.name || "").trim(),
          about: String(en?.about || "").trim(),
          location: String(en?.location || "").trim(),
          industry: String(en?.industry || "").trim(),
        },
        "pt-PT": {
          name: String(pt?.name || "").trim(),
          about: String(pt?.about || "").trim(),
          location: String(pt?.location || "").trim(),
          industry: String(pt?.industry || "").trim(),
        },
      };

      setIssuerDraft(nextDraft);
      setIssuerValidationError("");
      setIssuerLogoFile(null);
      setIssuerLogoUrl(resolveIssuerLogoFromLocalization(en) || resolveIssuerLogoFromLocalization(pt));
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "Unable to load issuer details." });
    } finally {
      setIsLoadingIssuerProfile(false);
    }
  }, [resolveIssuerLogoFromLocalization]);

  const fetchIssuers = useCallback(async () => {
    setIsLoadingIssuers(true);
    try {
      const response = await fetch("/api/issuers?maxCount=1000&offset=0", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load issuers (${response.status})`);
      }

      const payload = await response.json();
      const issuerRows = parseApiArray(payload)
        .map((item) => {
          const id = item?.issuer_id || item?.id || "";
          const name = item?.localization?.name || item?.issuer_name || item?.name || "";
          return {
            id,
            name: name || id,
          };
        })
        .filter((row) => row.id);

      setIssuerOptions(issuerRows);
      if (!issuerId && issuerRows.length > 0) {
        setIssuerId(issuerRows[0].id);
      }
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "Unable to load issuers." });
    } finally {
      setIsLoadingIssuers(false);
    }
  }, [issuerId]);

  const fetchIssuerUsers = useCallback(async (nextIssuerId) => {
    const resolvedIssuerId = String(nextIssuerId || "").trim();
    if (!resolvedIssuerId) {
      setAssignedUsers([]);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const response = await fetch(`/api/issuers/${encodeURIComponent(resolvedIssuerId)}/user`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load issuer users (${response.status})`);
      }

      const payload = await response.json();
      const users = parseApiArray(payload)
        .map((item) => String(item?.subject || item?.user_subject || item?.id || item || "").trim())
        .filter(Boolean);

      setAssignedUsers(Array.from(new Set(users)));
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "Unable to load issuer users." });
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchAccountUsernamesPage = useCallback(async ({ page, replace }) => {
    const requestId = accountUsernamesRequestRef.current + 1;
    accountUsernamesRequestRef.current = requestId;

    const mapUsernames = (rows) => rows
      .map((item) => String(item?.userName || "").trim())
      .filter(Boolean);

    if (replace) {
      setIsLoadingAccountUsernames(true);
      setIsLoadingMoreAccountUsernames(false);
    } else {
      setIsLoadingMoreAccountUsernames(true);
    }

    try {
      const response = await fetch(`/api/mockdata?page=${page}&limit=${USERNAME_PAGE_SIZE}&query=&filter=all`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load account usernames (${response.status})`);
      }

      const payload = await response.json();
      const pageRows = parseApiArray(payload);
      const pageUsernames = mapUsernames(pageRows);

      if (accountUsernamesRequestRef.current !== requestId) return;

      setAccountUsernames((prev) => {
        const merged = replace ? pageUsernames : [...prev, ...pageUsernames];
        return Array.from(new Set(merged)).sort((a, b) => a.localeCompare(b));
      });
      setHasMoreAccountUsernames(pageRows.length === USERNAME_PAGE_SIZE);
      setAccountUsernamesPage(page);
    } catch (error) {
      if (accountUsernamesRequestRef.current !== requestId) return;

      setFeedback((prev) => {
        if (prev.type === "error" && prev.message) return prev;
        return { type: "error", message: error?.message || "Unable to load account usernames." };
      });
    } finally {
      if (accountUsernamesRequestRef.current === requestId) {
        setIsLoadingAccountUsernames(false);
        setIsLoadingMoreAccountUsernames(false);
      }
    }
  }, []);

  const loadInitialAccountUsernames = useCallback(async () => {
    setAccountUsernames([]);
    setAccountUsernamesPage(0);
    setHasMoreAccountUsernames(true);
    await fetchAccountUsernamesPage({ page: 1, replace: true });
  }, [fetchAccountUsernamesPage]);

  const loadMoreAccountUsernames = useCallback(async () => {
    if (isLoadingAccountUsernames || isLoadingMoreAccountUsernames || !hasMoreAccountUsernames) {
      return;
    }
    await fetchAccountUsernamesPage({ page: accountUsernamesPage + 1, replace: false });
  }, [accountUsernamesPage, hasMoreAccountUsernames, isLoadingAccountUsernames, isLoadingMoreAccountUsernames, fetchAccountUsernamesPage]);

  useEffect(() => {
    return () => {
      accountUsernamesRequestRef.current += 1;
    };
  }, []);

  useEffect(() => {
    fetchIssuers();
  }, [fetchIssuers]);

  useEffect(() => {
    loadInitialAccountUsernames();
  }, [loadInitialAccountUsernames]);

  useEffect(() => {
    fetchIssuerUsers(issuerId);
  }, [issuerId, fetchIssuerUsers]);

  useEffect(() => {
    loadIssuerProfile(issuerId);
  }, [issuerId, loadIssuerProfile]);

  const handleIssuerDraftChange = (localization, field, value) => {
    setIssuerDraft((prev) => ({
      ...prev,
      [localization]: {
        ...prev[localization],
        [field]: value,
      },
    }));

    if (localization === "en-US" && field === "name") {
      setIssuerValidationError("");
    }
    setFeedback({ type: "", message: "" });
  };

  const handleIssuerLogoFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setIssuerLogoFile(file);
    setFeedback({ type: "", message: "" });

    if (!file) {
      if (issuerId) {
        loadIssuerProfile(issuerId);
      }
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setIssuerLogoUrl(previewUrl);
  };

  const uploadLogoForAllLocalizations = useCallback(async (targetIssuerId, file) => {
    if (!file) return;

    await Promise.all([
      uploadIssuerProfilePhoto(targetIssuerId, {
        file,
        localization: "en-US",
        description: "Issuer profile photo",
        imageName: file?.name || "issuer-profile-photo",
      }),
      uploadIssuerProfilePhoto(targetIssuerId, {
        file,
        localization: "pt-PT",
        description: "Issuer profile photo",
        imageName: file?.name || "issuer-profile-photo",
      }),
    ]);
  }, []);

  const handleCreateIssuer = async () => {
    const validationError = validateIssuerDraft(issuerDraft);
    if (validationError) {
      setIssuerValidationError(validationError);
      setFeedback({ type: "error", message: validationError });
      return;
    }

    setIssuerValidationError("");
    setIsCreatingIssuer(true);
    try {
      const createdIssuer = await createIssuer();
      const createdIssuerId = String(createdIssuer?.issuer_id || createdIssuer?.id || "").trim();

      if (!createdIssuerId) {
        throw new Error("Issuer was created but no issuer_id was returned.");
      }

      await upsertIssuerLocalizations(createdIssuerId, issuerDraft);
      await uploadLogoForAllLocalizations(createdIssuerId, issuerLogoFile);

      await fetchIssuers();
      setIssuerId(createdIssuerId);
      setFeedback({ type: "success", message: "Issuer created successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "Unable to create issuer." });
    } finally {
      setIsCreatingIssuer(false);
    }
  };

  const handleSaveIssuerProfile = async () => {
    const resolvedIssuerId = String(issuerId || "").trim();
    if (!resolvedIssuerId) {
      setFeedback({ type: "error", message: "Select an issuer first." });
      return;
    }

    const validationError = validateIssuerDraft(issuerDraft);
    if (validationError) {
      setIssuerValidationError(validationError);
      setFeedback({ type: "error", message: validationError });
      return;
    }

    setIssuerValidationError("");
    setIsSavingIssuerProfile(true);
    try {
      await upsertIssuerLocalizations(resolvedIssuerId, issuerDraft);
      await uploadLogoForAllLocalizations(resolvedIssuerId, issuerLogoFile);

      await fetchIssuers();
      await loadIssuerProfile(resolvedIssuerId);
      setFeedback({ type: "success", message: "Issuer details saved successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "Unable to save issuer details." });
    } finally {
      setIsSavingIssuerProfile(false);
    }
  };

  const handleAddUser = async () => {
    if (!issuerId) {
      setFeedback({ type: "error", message: "Select an issuer first." });
      return;
    }
    if (!isValidUsername(newUsername)) {
      setFeedback({ type: "error", message: "Enter a valid username without spaces or @." });
      return;
    }

    if (assignedUsernameSet.has(String(newUsername || "").trim())) {
      setFeedback({ type: "error", message: "This username is already assigned to the selected issuer." });
      return;
    }

    const subject = resolvedSubject;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ subject }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const backendMessage = String(payload?.message || payload?.error || "");
        const errorCode = extractErrorCode(payload);

        if (errorCode === "resource_already_exists") {
          throw new Error("This subject is already assigned to the selected issuer.");
        }
        if (errorCode === "missing_field") {
          throw new Error("Subject is required in request body.");
        }
        if (errorCode === "invalid_field") {
          throw new Error("Subject format is invalid.");
        }
        throw new Error(backendMessage || `Failed to add user (${response.status})`);
      }

      setAssignedUsers((prev) => (prev.includes(subject) ? prev : [...prev, subject]));
      setNewUsername("");
      setSelectedAccountUsername("");
      setFeedback({ type: "success", message: "User added to issuer successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "Unable to add user to issuer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (subject) => {
    if (!issuerId || !subject) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/user/${encodeURIComponent(subject)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
        const backendMessage = String(payload?.message || payload?.error || "");
        const errorCode = extractErrorCode(payload);
        if (errorCode === "subject_issuer_relation_not_found") {
          throw new Error("This subject is not assigned to the selected issuer.");
        }
        throw new Error(backendMessage || `Failed to remove user (${response.status})`);
      }

      setAssignedUsers((prev) => prev.filter((item) => item !== subject));
      setFeedback({ type: "success", message: "User removed from issuer." });
    } catch (error) {
      setFeedback({ type: "error", message: error?.message || "Unable to remove user from issuer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--brand-text)]">Issuer Accounts</h2>
          <p className="text-sm text-[var(--brand-text-secondary)]">Link and unlink issuer users using Neuron subject JIDs.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            fetchIssuers();
            loadInitialAccountUsernames();
            fetchIssuerUsers(issuerId);
            loadIssuerProfile(issuerId);
          }}
          disabled={isLoadingIssuers || isLoadingUsers || isSubmitting || isIssuerActionBusy}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 py-2 text-sm font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={`${isLoadingIssuers || isLoadingUsers || isIssuerActionBusy ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
        <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
          <label htmlFor="issuer-select" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Select Issuer
          </label>
          <select
            id="issuer-select"
            value={issuerId}
            onChange={(event) => {
              setIssuerId(event.target.value);
              setIssuerValidationError("");
              setFeedback({ type: "", message: "" });
            }}
            disabled={isLoadingIssuers || isSubmitting || isIssuerActionBusy}
            className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 py-2 text-sm text-[var(--brand-text)] focus:border-[var(--brand-primary)] focus:outline-none"
          >
            <option value="">Select an issuer</option>
            {issuerOptions.map((issuerOption) => (
              <option key={issuerOption.id} value={issuerOption.id}>
                {issuerOption.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
            {issuerId ? `Issuer ID: ${issuerId}` : "Choose an issuer to manage account assignments."}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
          <label htmlFor="username-input" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Add User
          </label>
          <label htmlFor="existing-username-select" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Existing Usernames
          </label>
          <select
            id="existing-username-select"
            value={selectedAccountUsername}
            onChange={(event) => {
              const pickedUsername = event.target.value;
              setSelectedAccountUsername(pickedUsername);
              setNewUsername(pickedUsername);
              setFeedback({ type: "", message: "" });
            }}
            disabled={!issuerId || isSubmitting || isIssuerActionBusy || (isLoadingAccountUsernames && accountUsernames.length === 0)}
            className="mb-3 w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 py-2 text-sm text-[var(--brand-text)] focus:border-[var(--brand-primary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              {(isLoadingAccountUsernames && accountUsernames.length === 0)
                ? "Loading usernames..."
                : availableAccountUsernames.length > 0
                  ? "Select an existing username"
                  : "No available usernames"}
            </option>
            {availableAccountUsernames.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
          <div className="-mt-1 mb-2 flex items-center justify-between gap-2">
            {isLoadingMoreAccountUsernames ? (
              <p className="text-xs text-[var(--brand-text-secondary)] inline-flex items-center gap-1"><FiLoader className="animate-spin" /> Loading 10 more...</p>
            ) : (
              <span className="text-xs text-[var(--brand-text-secondary)]">
                {accountUsernames.length > 0 ? `${accountUsernames.length} username(s) loaded` : ""}
              </span>
            )}
            {hasMoreAccountUsernames ? (
              <button
                type="button"
                onClick={loadMoreAccountUsernames}
                disabled={!issuerId || isSubmitting || isIssuerActionBusy || isLoadingAccountUsernames || isLoadingMoreAccountUsernames}
                className="rounded-lg border border-[var(--brand-border)] px-3 py-1 text-xs font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Load 10 More
              </button>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex w-full overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)]">
              <input
                id="username-input"
                type="text"
                value={newUsername}
                onChange={(event) => {
                  setNewUsername(event.target.value);
                  setSelectedAccountUsername("");
                  setFeedback({ type: "", message: "" });
                }}
                placeholder="username"
                disabled={!issuerId || isSubmitting || isIssuerActionBusy}
                className="w-full border-none bg-transparent px-3 py-2 text-sm text-[var(--brand-text)] placeholder:text-[var(--brand-text-secondary)] focus:outline-none"
              />
              <span className="inline-flex items-center border-l border-[var(--brand-border)] px-3 py-2 text-xs text-[var(--brand-text-secondary)]">
                {subjectSuffix}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddUser}
              disabled={!issuerId || !isValidUsername(newUsername) || assignedUsernameSet.has(String(newUsername || "").trim()) || isSubmitting || isIssuerActionBusy}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[var(--brand-button)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <FiLoader className="animate-spin" /> : <FiUserPlus />}
              Add User
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">Final subject: {resolvedSubject || `username${subjectSuffix}`}</p>

          {feedback.message ? (
            <p className={`mt-3 text-sm ${feedback.type === "error" ? "text-rose-500" : "text-emerald-500"}`}>
              {feedback.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--brand-text)]">Issuer Profile</h3>
            <p className="text-xs text-[var(--brand-text-secondary)]">
              Create a new issuer or update the selected issuer details. User linking stays below.
            </p>
          </div>
          {isLoadingIssuerProfile ? (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--brand-text-secondary)]"><FiLoader className="animate-spin" /> Loading profile...</span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">Issuer Localization (EN)</p>
            <div className="grid grid-cols-1 gap-2">
              <label className="text-xs text-[var(--brand-text-secondary)]">Name (EN)</label>
              <input
                type="text"
                maxLength={40}
                value={issuerDraft["en-US"].name}
                onChange={(event) => handleIssuerDraftChange("en-US", "name", event.target.value)}
                disabled={isIssuerActionBusy}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
              />

              <label className="text-xs text-[var(--brand-text-secondary)]">About (EN)</label>
              <textarea
                rows={4}
                value={issuerDraft["en-US"].about}
                onChange={(event) => handleIssuerDraftChange("en-US", "about", event.target.value)}
                disabled={isIssuerActionBusy}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
              />

              <label className="text-xs text-[var(--brand-text-secondary)]">Location (EN)</label>
              <input
                type="text"
                maxLength={80}
                value={issuerDraft["en-US"].location}
                onChange={(event) => handleIssuerDraftChange("en-US", "location", event.target.value)}
                disabled={isIssuerActionBusy}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
              />

              <label className="text-xs text-[var(--brand-text-secondary)]">Industry (EN)</label>
              <input
                type="text"
                maxLength={80}
                value={issuerDraft["en-US"].industry}
                onChange={(event) => handleIssuerDraftChange("en-US", "industry", event.target.value)}
                disabled={isIssuerActionBusy}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">Issuer Localization (PT)</p>
            <div className="grid grid-cols-1 gap-2">
              <label className="text-xs text-[var(--brand-text-secondary)]">Name (PT)</label>
              <input
                type="text"
                maxLength={40}
                value={issuerDraft["pt-PT"].name}
                onChange={(event) => handleIssuerDraftChange("pt-PT", "name", event.target.value)}
                disabled={isIssuerActionBusy}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
              />

              <label className="text-xs text-[var(--brand-text-secondary)]">About (PT)</label>
              <textarea
                rows={4}
                value={issuerDraft["pt-PT"].about}
                onChange={(event) => handleIssuerDraftChange("pt-PT", "about", event.target.value)}
                disabled={isIssuerActionBusy}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
              />

              <label className="text-xs text-[var(--brand-text-secondary)]">Location (PT)</label>
              <input
                type="text"
                maxLength={80}
                value={issuerDraft["pt-PT"].location}
                onChange={(event) => handleIssuerDraftChange("pt-PT", "location", event.target.value)}
                disabled={isIssuerActionBusy}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
              />

              <label className="text-xs text-[var(--brand-text-secondary)]">Industry (PT)</label>
              <input
                type="text"
                maxLength={80}
                value={issuerDraft["pt-PT"].industry}
                onChange={(event) => handleIssuerDraftChange("pt-PT", "industry", event.target.value)}
                disabled={isIssuerActionBusy}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">Issuer Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleIssuerLogoFileChange}
              disabled={isIssuerActionBusy}
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 py-2 text-sm text-[var(--brand-text)]"
            />
            {issuerLogoUrl ? (
              <div className="mt-2 flex items-center gap-2">
                <img src={issuerLogoUrl} alt="Issuer logo preview" className="h-12 w-12 rounded-full border border-[var(--brand-border)] object-cover" />
                <span className="text-xs text-[var(--brand-text-secondary)]">Logo preview</span>
              </div>
            ) : null}
            {issuerValidationError ? <p className="mt-2 text-xs text-rose-500">{issuerValidationError}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={handleCreateIssuer}
              disabled={isIssuerActionBusy || isSubmitting || isLoadingIssuers || isLoadingUsers}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-4 py-2 text-sm font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingIssuer ? <FiLoader className="animate-spin" /> : <FiUserPlus />}
              Create New Issuer
            </button>
            <button
              type="button"
              onClick={handleSaveIssuerProfile}
              disabled={!issuerId || isIssuerActionBusy || isSubmitting || isLoadingIssuers || isLoadingUsers}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-button)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingIssuerProfile ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
              Save Issuer Changes
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
        <div className="mb-3 flex items-center gap-2 text-[var(--brand-text)]">
          <FiUsers />
          <h3 className="text-sm font-semibold">Issuer Users</h3>
        </div>

        {isLoadingUsers ? (
          <div className="flex items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
            <FiLoader className="animate-spin" /> Loading users...
          </div>
        ) : assignedUsers.length === 0 ? (
          <p className="text-sm text-[var(--brand-text-secondary)]">No users are currently assigned to this issuer.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {assignedUsers.map((subject) => (
              <li key={subject} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 py-2">
                <span className="truncate text-sm text-[var(--brand-text)]" title={subject}>{subject}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveUser(subject)}
                  disabled={isSubmitting || isIssuerActionBusy}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-400/30 px-2 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiTrash2 /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
