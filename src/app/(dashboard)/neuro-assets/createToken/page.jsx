"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useLanguage, content as i18nContent } from "../../../../../context/LanguageContext";
import { useRouter } from "next/navigation";

export default function CreateTokenPage() {
  const { language } = useLanguage();
  const t = i18nContent[language]?.assetOrders || {};
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [storageSummary, setStorageSummary] = useState([]);

  const getDraftStorageKeys = () => {
    if (typeof window === "undefined") return ["draftTokens"];
    const userKey = localStorage.getItem("userEmail") || localStorage.getItem("loggedInUser") || "";
    const primary = userKey ? `draftTokens:${userKey}` : "draftTokens";
    return [primary, "draftTokens"];
  };

  const loadDrafts = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsLoading(true);
    try {
      const keys = getDraftStorageKeys();
      const summary = keys.map((key) => {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || "[]");
          return { key, count: Array.isArray(parsed) ? parsed.length : 0 };
        } catch {
          return { key, count: 0 };
        }
      });
      setStorageSummary(summary);

      const collected = keys.flatMap((key) => {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || "[]");
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      });
      const deduped = [];
      const seen = new Set();
      collected.forEach((d, idx) => {
        const id = d.id || `draft-${idx}`;
        if (seen.has(id)) return;
        seen.add(id);
        deduped.push({
          id,
          name: d.name || d?.assetDetails?.name || "Untitled token",
          type: d.assetDetails?.definition === "volume" ? "Volume" : d.assetDetails?.definition === "units" ? "Units" : "Units",
          value: "Draft",
        });
      });
      setDrafts(
        deduped.length
          ? deduped
          : [
              { id: "sample-1", name: "Q3 compensation", type: "Agriculture", value: "20,000.00 EUR" },
              { id: "sample-2", name: "Q3 compensation", type: "Agriculture", value: "20,000.00 EUR" },
            ]
      );
    } catch (e) {
      setDrafts([
        { id: "sample-1", name: "Q3 compensation", type: "Agriculture", value: "20,000.00 EUR" },
        { id: "sample-2", name: "Q3 compensation", type: "Agriculture", value: "20,000.00 EUR" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
    window.addEventListener("focus", loadDrafts);
    return () => window.removeEventListener("focus", loadDrafts);
  }, [loadDrafts]);

  const filteredDrafts = useMemo(() => {
    return drafts.filter((draft) => {
      const matchesSearch = draft.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || draft.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, drafts]);

  const pageCount = Math.max(1, Math.ceil(filteredDrafts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedDrafts = filteredDrafts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(pageCount, p + 1));

  const handleDelete = (id) => {
    const keys = getDraftStorageKeys();
    const filterOut = (arr) => arr.filter((d) => d.id !== id);
    try {
      keys.forEach((key) => {
        const parsed = JSON.parse(localStorage.getItem(key) || "[]");
        const next = Array.isArray(parsed) ? filterOut(parsed) : [];
        localStorage.setItem(key, JSON.stringify(next));
      });
      setDrafts((prev) => filterOut(prev));
    } catch (e) {
      console.error("Failed to delete draft", e);
    }
  };

  const handleResetDrafts = () => {
    if (typeof window === "undefined") return;
    const keys = getDraftStorageKeys();
    keys.forEach((key) => localStorage.removeItem(key));
    setDrafts([
      { id: "sample-1", name: "Q3 compensation", type: "Agriculture", value: "20,000.00 EUR" },
      { id: "sample-2", name: "Q3 compensation", type: "Agriculture", value: "20,000.00 EUR" },
    ]);
  };

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <div className="flex flex-col rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
        <h1 className="text-2xl font-semibold text-[var(--brand-text)]">
            {t.actions?.createToken || "Set up a new token"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--brand-text-secondary)]">
          Lorem ipsum dolor sit amet consectetur. Fusce risus turpis tellus sagittis natoque. Eu
          massa dolor ac pharetra egestas nibh. Sem massa enim tortor du eu eu maecenas. Diam amet
          aliquam in elit proin rhoncus nunc nam sed. Pretium iaculis nibh rutrum mauris aliquet.
          Integer bibendum phasellus diam et adipiscing.
        </p>
          
        <button
          type="button"
          className="mt-4 ml-auto inline-flex items-center justify-center rounded-lg bg-[#8F40D4] px-4 py-2 text-sm font-semibold text-white shadow-sm"
          onClick={() => router.push("/neuro-assets/assetType")}
        >
          {t.actions?.createToken || "Create a new token"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--brand-text)]">Your drafts</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2">
              <Search className="mr-2 h-4 w-4 text-[var(--brand-text-secondary)]" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-40 bg-transparent text-sm text-[var(--brand-text)] outline-none placeholder:text-[var(--brand-text-secondary)]"
              />
            </div>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 pr-8 text-sm text-[var(--brand-text)]"
              >
                <option value="All">All</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Units">Units</option>
                <option value="Volume">Volume</option>
              </select>
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)]">
          <div className="grid grid-cols-4 border-b border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-sm font-semibold text-[var(--brand-text-secondary)]">
            <div>Token name</div>
            <div>Token type</div>
            <div className="flex items-center gap-2">
              <span>Value</span>
              <span className="text-[var(--brand-text-secondary)]">▼</span>
            </div>
            <div className="text-right">Actions</div>
          </div>
          {paginatedDrafts.length === 0 && (
            <div className="px-4 py-6 text-sm text-[var(--brand-text-secondary)]">
              {isLoading ? "Loading drafts..." : "No drafts yet."}
            </div>
          )}
          {paginatedDrafts.map((draft, idx) => (
            <div
              key={draft.id || `${draft.name}-${idx}`}
              className="grid grid-cols-4 items-center px-4 py-3 text-sm text-[var(--brand-text)] hover:bg-[var(--brand-background)] transition"
            >
              <div
                className="font-semibold cursor-pointer"
                onClick={() => router.push(`/neuro-assets/tokenPreview?id=${encodeURIComponent(draft.id || "")}`)}
              >
                {draft.name}
              </div>
              <div className="text-[var(--brand-text-secondary)] cursor-pointer" onClick={() => router.push(`/neuro-assets/tokenPreview?id=${encodeURIComponent(draft.id || "")}`)}>
                {draft.type}
              </div>
              <div className="font-medium cursor-pointer" onClick={() => router.push(`/neuro-assets/tokenPreview?id=${encodeURIComponent(draft.id || "")}`)}>
                {draft.value}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(draft.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={page === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--brand-border)] text-[var(--brand-text)] disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-sm text-[var(--brand-text)]">
            {page}
          </div>
          <button
            type="button"
            onClick={goNext}
            disabled={page === pageCount}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--brand-border)] text-[var(--brand-text)] disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-text-secondary)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}
