"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiLoader, FiRefreshCw, FiTrash2, FiUserPlus, FiUsers } from "react-icons/fi";

const parseApiArray = (payload) => {
  const candidates = [
    payload,
    payload?.data,
    payload?.data?.data,
    payload?.results,
    payload?.items,
  ];
  const found = candidates.find((item) => Array.isArray(item));
  return Array.isArray(found) ? found : [];
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

export default function IssuerAccountsManager({ initialIssuerId = "" }) {
  const [issuerId, setIssuerId] = useState(String(initialIssuerId || ""));
  const [newUsername, setNewUsername] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [issuerOptions, setIssuerOptions] = useState([]);
  const [isLoadingIssuers, setIsLoadingIssuers] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
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

  const fetchIssuers = useCallback(async () => {
    setIsLoadingIssuers(true);
    try {
      const response = await fetch("/api/issuers", {
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

  useEffect(() => {
    fetchIssuers();
  }, [fetchIssuers]);

  useEffect(() => {
    fetchIssuerUsers(issuerId);
  }, [issuerId, fetchIssuerUsers]);

  const handleAddUser = async () => {
    if (!issuerId) {
      setFeedback({ type: "error", message: "Select an issuer first." });
      return;
    }
    if (!isValidUsername(newUsername)) {
      setFeedback({ type: "error", message: "Enter a valid username without spaces or @." });
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
            fetchIssuerUsers(issuerId);
          }}
          disabled={isLoadingIssuers || isLoadingUsers || isSubmitting}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] px-4 py-2 text-sm font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={`${isLoadingIssuers || isLoadingUsers ? "animate-spin" : ""}`} />
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
              setFeedback({ type: "", message: "" });
            }}
            disabled={isLoadingIssuers || isSubmitting}
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex w-full overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)]">
              <input
                id="username-input"
                type="text"
                value={newUsername}
                onChange={(event) => setNewUsername(event.target.value)}
                placeholder="username"
                disabled={!issuerId || isSubmitting}
                className="w-full border-none bg-transparent px-3 py-2 text-sm text-[var(--brand-text)] placeholder:text-[var(--brand-text-secondary)] focus:outline-none"
              />
              <span className="inline-flex items-center border-l border-[var(--brand-border)] px-3 py-2 text-xs text-[var(--brand-text-secondary)]">
                {subjectSuffix}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddUser}
              disabled={!issuerId || !isValidUsername(newUsername) || isSubmitting}
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
                  disabled={isSubmitting}
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
