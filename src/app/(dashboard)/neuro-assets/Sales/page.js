"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiLoader, FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import { listGlobalSales, listIssuerSales, listProjectSales } from "@/lib/adminSales";

const DEFAULT_LIMIT = 25;

const makeDefaultPager = () => ({
  history: [null],
  index: 0,
  nextToken: null,
  count: 0,
});

function getResourceKey(scope, resourceId) {
  if (scope === "issuer") return `sales:issuer:${resourceId || "none"}`;
  if (scope === "project") return `sales:project:${resourceId || "none"}`;
  return "sales:global";
}

function parseApiArray(payload) {
  const candidates = [payload?.data?.data, payload?.data, payload];
  const found = candidates.find((item) => Array.isArray(item));
  return Array.isArray(found) ? found : [];
}

function formatDate(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "-";
  const millis = numeric < 1e12 ? numeric * 1000 : numeric;
  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatAmountWithCurrency(value, currency, displayValue) {
  if (displayValue) return String(displayValue);

  if (value === null || value === undefined || value === "") return "-";

  const normalizedCurrency = String(currency || "").trim().toUpperCase();
  return normalizedCurrency ? `${value} ${normalizedCurrency}` : String(value);
}

export default function SalesPage() {
  const [scope, setScope] = useState("global");
  const [issuerId, setIssuerId] = useState("");
  const [projectId, setProjectId] = useState("");

  const [issuerSearch, setIssuerSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const [issuerOptions, setIssuerOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pagers, setPagers] = useState({});

  const [filterDraft, setFilterDraft] = useState({
    buyer_legal_id: "",
    created_contract_id: "",
  });
  const [filters, setFilters] = useState({
    buyer_legal_id: "",
    created_contract_id: "",
  });

  const activeResourceId = useMemo(() => {
    if (scope === "issuer") return issuerId.trim();
    if (scope === "project") return projectId.trim();
    return "";
  }, [scope, issuerId, projectId]);

  const resourceKey = useMemo(() => getResourceKey(scope, activeResourceId), [scope, activeResourceId]);
  const currentPager = pagers[resourceKey] || makeDefaultPager();

  const displayedRows = useMemo(() => rows.filter((row) => row?.paid === true), [rows]);
  const paidCount = useMemo(() => displayedRows.length, [displayedRows]);

  const filteredIssuerOptions = useMemo(() => {
    const q = issuerSearch.trim().toLowerCase();
    if (!q) return issuerOptions;
    return issuerOptions.filter((item) => (`${item.name} ${item.id}`).toLowerCase().includes(q));
  }, [issuerOptions, issuerSearch]);

  const filteredProjectOptions = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return projectOptions;
    return projectOptions.filter((item) => (`${item.title} ${item.id} ${item.issuerName}`).toLowerCase().includes(q));
  }, [projectOptions, projectSearch]);

  const fetchLookups = useCallback(async () => {
    setLoadingLookups(true);
    try {
      const [issuerResponse, projectResponse] = await Promise.all([
        fetch("/api/issuers", { method: "GET", headers: { Accept: "application/json" }, credentials: "include", cache: "no-store" }),
        fetch("/api/projects?localization=en-US", { method: "GET", headers: { Accept: "application/json" }, credentials: "include", cache: "no-store" }),
      ]);

      const [issuerPayload, projectPayload] = await Promise.all([
        issuerResponse.ok ? issuerResponse.json() : Promise.resolve(null),
        projectResponse.ok ? projectResponse.json() : Promise.resolve(null),
      ]);

      const issuers = parseApiArray(issuerPayload)
        .map((item) => ({
          id: item?.issuer_id || item?.id || "",
          name: item?.localization?.name || item?.issuer_name || item?.name || item?.issuer_id || item?.id || "Unknown issuer",
        }))
        .filter((item) => item.id);

      const projects = parseApiArray(projectPayload)
        .map((item) => ({
          id: item?.project_id || item?.id || "",
          title: item?.localization?.title || item?.token?.project_label || item?.token?.friendly_name || item?.project_id || item?.id || "Untitled project",
          issuerName: item?.token?.issuer_name || item?.issuer?.localization?.name || "Unknown issuer",
        }))
        .filter((item) => item.id);

      setIssuerOptions(issuers);
      setProjectOptions(projects);

      if (!issuerId && issuers.length > 0) setIssuerId(issuers[0].id);
      if (!projectId && projects.length > 0) setProjectId(projects[0].id);
    } catch {
      setError("Failed to load issuer/project selectors.");
    } finally {
      setLoadingLookups(false);
    }
  }, [issuerId, projectId]);

  const runQuery = useCallback(async ({
    scopeOverride,
    resourceIdOverride,
    filtersOverride,
    pagerOverride,
    resetPager = false,
    tokenOverride,
  } = {}) => {
    const resolvedScope = scopeOverride || scope;
    const resolvedResourceId = resourceIdOverride !== undefined
      ? String(resourceIdOverride || "").trim()
      : (resolvedScope === "issuer" ? issuerId.trim() : resolvedScope === "project" ? projectId.trim() : "");

    if ((resolvedScope === "issuer" || resolvedScope === "project") && !resolvedResourceId) {
      setRows([]);
      setError(resolvedScope === "issuer" ? "Select an issuer to view sales." : "Select a project to view sales.");
      return;
    }

    const resolvedFilters = filtersOverride || filters;
    const key = getResourceKey(resolvedScope, resolvedResourceId);
    const pager = pagerOverride || (resetPager ? makeDefaultPager() : (pagers[key] || makeDefaultPager()));
    const token = tokenOverride !== undefined ? tokenOverride : (pager.history[pager.index] || null);

    const params = {
      limit,
      ...(token ? { continuation_token: token } : { offset: 0 }),
      paid: true,
      ...(resolvedFilters.buyer_legal_id ? { buyer_legal_id: resolvedFilters.buyer_legal_id.trim() } : {}),
      ...(resolvedFilters.created_contract_id ? { created_contract_id: resolvedFilters.created_contract_id.trim() } : {}),
      extra: true,
    };

    setLoading(true);
    setError("");

    try {
      const result = resolvedScope === "issuer"
        ? await listIssuerSales(resolvedResourceId, params)
        : resolvedScope === "project"
          ? await listProjectSales(resolvedResourceId, params)
          : await listGlobalSales(params);

      setRows(Array.isArray(result.data) ? result.data : []);
      setPagers((prev) => ({
        ...prev,
        [key]: {
          ...pager,
          count: Number.isFinite(Number(result.count)) ? Number(result.count) : 0,
          nextToken: result.continuation_token || null,
        },
      }));
    } catch (requestError) {
      const code = String(requestError?.errorCode || "").toLowerCase();
      if (code === "wrong_resource" || code === "invalid_continuation_token") {
        const freshPager = makeDefaultPager();
        setPagers((prev) => ({ ...prev, [key]: freshPager }));
        await runQuery({
          scopeOverride: resolvedScope,
          resourceIdOverride: resolvedResourceId,
          filtersOverride: resolvedFilters,
          pagerOverride: freshPager,
          tokenOverride: null,
          resetPager: true,
        });
        return;
      }

      setRows([]);
      setError(requestError?.message || "Failed to load sales.");
    } finally {
      setLoading(false);
    }
  }, [scope, issuerId, projectId, filters, pagers, limit]);

  const handleApplyFilters = async () => {
    const nextFilters = {
      buyer_legal_id: String(filterDraft.buyer_legal_id || "").trim(),
      created_contract_id: String(filterDraft.created_contract_id || "").trim(),
    };

    setFilters(nextFilters);
    const key = getResourceKey(scope, activeResourceId);
    const freshPager = makeDefaultPager();
    setPagers((prev) => ({ ...prev, [key]: freshPager }));

    await runQuery({
      filtersOverride: nextFilters,
      pagerOverride: freshPager,
      tokenOverride: null,
      resetPager: true,
    });
  };

  const handleClearFilters = async () => {
    const empty = { buyer_legal_id: "", created_contract_id: "" };
    setFilterDraft(empty);
    setFilters(empty);
    const key = getResourceKey(scope, activeResourceId);
    const freshPager = makeDefaultPager();
    setPagers((prev) => ({ ...prev, [key]: freshPager }));

    await runQuery({
      filtersOverride: empty,
      pagerOverride: freshPager,
      tokenOverride: null,
      resetPager: true,
    });
  };

  const handlePrevPage = async () => {
    if (currentPager.index <= 0 || loading) return;
    const key = resourceKey;
    const nextPager = {
      ...(pagers[key] || makeDefaultPager()),
      index: Math.max(0, (pagers[key]?.index || 0) - 1),
    };
    setPagers((prev) => ({ ...prev, [key]: nextPager }));
    await runQuery({ pagerOverride: nextPager });
  };

  const handleNextPage = async () => {
    if (!currentPager.nextToken || loading) return;
    const key = resourceKey;
    const existing = pagers[key] || makeDefaultPager();
    const nextIndex = existing.index + 1;
    const nextHistory = [...existing.history];
    if (nextHistory[nextIndex] !== currentPager.nextToken) {
      nextHistory.splice(nextIndex);
      nextHistory.push(currentPager.nextToken);
    }

    const nextPager = {
      ...existing,
      history: nextHistory,
      index: nextIndex,
    };

    setPagers((prev) => ({ ...prev, [key]: nextPager }));
    await runQuery({ pagerOverride: nextPager });
  };

  const handleScopeChange = async (nextScope) => {
    setScope(nextScope);
    setError("");

    if (nextScope === "global") {
      const key = getResourceKey("global", "");
      const pager = makeDefaultPager();
      setPagers((prev) => ({ ...prev, [key]: pager }));
      await runQuery({ scopeOverride: "global", resourceIdOverride: "", pagerOverride: pager, tokenOverride: null, resetPager: true });
    }
  };

  const loadIssuerSales = async () => {
    const selectedId = issuerId.trim();
    if (!selectedId) return;
    const key = getResourceKey("issuer", selectedId);
    const pager = makeDefaultPager();
    setPagers((prev) => ({ ...prev, [key]: pager }));
    await runQuery({ scopeOverride: "issuer", resourceIdOverride: selectedId, pagerOverride: pager, tokenOverride: null, resetPager: true });
  };

  const loadProjectSales = async () => {
    const selectedId = projectId.trim();
    if (!selectedId) return;
    const key = getResourceKey("project", selectedId);
    const pager = makeDefaultPager();
    setPagers((prev) => ({ ...prev, [key]: pager }));
    await runQuery({ scopeOverride: "project", resourceIdOverride: selectedId, pagerOverride: pager, tokenOverride: null, resetPager: true });
  };

  const openProjectDrilldown = async (id) => {
    const selectedId = String(id || "").trim();
    if (!selectedId) return;
    setScope("project");
    setProjectId(selectedId);
    const key = getResourceKey("project", selectedId);
    const pager = makeDefaultPager();
    setPagers((prev) => ({ ...prev, [key]: pager }));
    await runQuery({ scopeOverride: "project", resourceIdOverride: selectedId, pagerOverride: pager, tokenOverride: null, resetPager: true });
  };

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    const key = getResourceKey("global", "");
    const pager = makeDefaultPager();
    setPagers((prev) => ({ ...prev, [key]: pager }));
    runQuery({ scopeOverride: "global", resourceIdOverride: "", pagerOverride: pager, tokenOverride: null, resetPager: true });
    // Intentionally run once on mount to avoid a fetch loop from callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[var(--brand-background)] p-6 text-[var(--brand-text)]">
      <section className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales Command Center</h1>
            <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
              Professional super-admin sales workspace with smart drill-down and resilient pagination.
            </p>
          </div>

          <button
            type="button"
            onClick={() => runQuery({ resetPager: false })}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-2 text-sm font-semibold hover:bg-[var(--brand-hover)] disabled:opacity-60"
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
            Refresh
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => handleScopeChange("global")} className={`rounded-xl px-4 py-3 text-sm font-semibold ${scope === "global" ? "bg-[var(--brand-button)] text-white" : "border border-[var(--brand-border)]"}`}>
            Sales Overview
          </button>
          <button type="button" onClick={() => handleScopeChange("issuer")} className={`rounded-xl px-4 py-3 text-sm font-semibold ${scope === "issuer" ? "bg-[var(--brand-button)] text-white" : "border border-[var(--brand-border)]"}`}>
            Issuer Sales Detail
          </button>
          <button type="button" onClick={() => handleScopeChange("project")} className={`rounded-xl px-4 py-3 text-sm font-semibold ${scope === "project" ? "bg-[var(--brand-button)] text-white" : "border border-[var(--brand-border)]"}`}>
            Project Sales Detail
          </button>
        </div>

        {scope === "issuer" ? (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr_auto]">
            <input
              type="text"
              value={issuerSearch}
              onChange={(event) => setIssuerSearch(event.target.value)}
              placeholder="Search issuer..."
              className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm"
            />
            <select value={issuerId} onChange={(event) => setIssuerId(event.target.value)} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm" disabled={loadingLookups}>
              {filteredIssuerOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
            <button type="button" onClick={loadIssuerSales} className="rounded-lg bg-[var(--brand-button)] px-4 py-2 text-sm font-semibold text-white">Load Issuer Sales</button>
          </div>
        ) : null}

        {scope === "project" ? (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr_auto]">
            <input
              type="text"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              placeholder="Search project..."
              className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm"
            />
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm" disabled={loadingLookups}>
              {filteredProjectOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.title} | {option.issuerName}</option>
              ))}
            </select>
            <button type="button" onClick={loadProjectSales} className="rounded-lg bg-[var(--brand-button)] px-4 py-2 text-sm font-semibold text-white">Load Project Sales</button>
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">

          <input
            type="text"
            value={filterDraft.buyer_legal_id}
            onChange={(event) => setFilterDraft((prev) => ({ ...prev, buyer_legal_id: event.target.value }))}
            placeholder="buyer_legal_id"
            className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm"
          />

          <input
            type="text"
            value={filterDraft.created_contract_id}
            onChange={(event) => setFilterDraft((prev) => ({ ...prev, created_contract_id: event.target.value }))}
            placeholder="created_contract_id"
            className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm"
          />

          <input
            type="number"
            min="1"
            max="100"
            value={limit}
            onChange={(event) => setLimit(Math.max(1, Number(event.target.value || DEFAULT_LIMIT)))}
            className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            <button type="button" onClick={handleApplyFilters} className="flex-1 rounded-lg bg-[var(--brand-button)] px-3 py-2 text-sm font-semibold text-white">Apply</button>
            <button type="button" onClick={handleClearFilters} className="flex-1 rounded-lg border border-[var(--brand-border)] px-3 py-2 text-sm font-semibold">Clear</button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">Rows in view</p>
            <p className="mt-1 text-2xl font-bold">{displayedRows.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">Paid</p>
            <p className="mt-1 text-2xl font-bold text-emerald-500">{paidCount}</p>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-lg border border-rose-300/40 bg-rose-500/5 px-3 py-2 text-sm text-rose-500">{error}</p> : null}

        <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--brand-border)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--brand-background)] text-left text-xs uppercase tracking-wide text-[var(--brand-text-secondary)]">
              <tr>
                <th className="px-3 py-2">id</th>
                <th className="px-3 py-2">project</th>
                <th className="px-3 py-2">issuer</th>
                <th className="px-3 py-2">token_count</th>
                <th className="px-3 py-2">paying_price</th>
                <th className="px-3 py-2">token_valuation</th>
                <th className="px-3 py-2">created_contract_id</th>
                <th className="px-3 py-2">created</th>
                <th className="px-3 py-2">buyer</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-8 text-center text-[var(--brand-text-secondary)]" colSpan={9}>
                    <span className="inline-flex items-center gap-2"><FiLoader className="animate-spin" /> Loading sales...</span>
                  </td>
                </tr>
              ) : displayedRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-[var(--brand-text-secondary)]" colSpan={9}>No paid sales found for this view.</td>
                </tr>
              ) : (
                displayedRows.map((row, index) => (
                  <tr key={`${row.id || "sale"}-${row.project_id || "project"}-${row.created || index}-${index}`} className="border-t border-[var(--brand-border)] hover:bg-[var(--brand-hover)]/40">
                    <td className="px-3 py-2 font-mono text-xs">{row.id}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => openProjectDrilldown(row.project_id)} className="text-xs font-semibold text-[var(--brand-button)] underline">{row?.extra?.project_name || row.project_id || "Unknown project"}</button>
                    </td>
                    <td className="px-3 py-2 text-xs">{row?.extra?.issuer_name || "Unknown issuer"}</td>
                    <td className="px-3 py-2">{row.token_count}</td>
                    <td className="px-3 py-2">{formatAmountWithCurrency(row.paying_price, row.currency, row.paying_price_display)}</td>
                    <td className="px-3 py-2">{formatAmountWithCurrency(row.token_valuation, row.token_valuation_currency, row.token_valuation_display)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.created_contract_id || "-"}</td>
                    <td className="px-3 py-2">{formatDate(row.created)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold">{row.full_name || "Unknown buyer"}</span>
                        <span className="text-xs text-[var(--brand-text-secondary)]">{row.email || "-"}</span>
                        <span className="font-mono text-[11px] text-[var(--brand-text-secondary)]">{row.buyer_legal_id || "-"}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--brand-text-secondary)] inline-flex items-center gap-1">
            <FiTrendingUp /> {resourceKey} | count: {currentPager.count} | page: {currentPager.index + 1}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={handlePrevPage} disabled={loading || currentPager.index <= 0} className="rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50">Previous</button>
            <button type="button" onClick={handleNextPage} disabled={loading || !currentPager.nextToken} className="rounded-lg bg-[var(--brand-button)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
