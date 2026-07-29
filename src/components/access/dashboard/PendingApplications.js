"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useLanguage, content } from "../../../../context/LanguageContext";

export default function PendingApplications({ compact = false }) {
  const { language } = useLanguage();
  const t = content[language];
  const statusMap = t?.pendingApplicationsStatuses || {};
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathnameWithFilter = `${pathname}?${params}`;
  const router = useRouter();

  function handleNavigate(id) {
    const encodedRef = encodeURIComponent(pathnameWithFilter);
    router.push(`/neuro-access/detailpage/${id}?ref=${encodedRef}&tab=identity`);
  }

  useEffect(() => {
    async function fetchPendingApplications() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        // Request the first 6 pending (Created) identities.
        const requestBody = {
          page: 1,
          limit: 6,         // backend will handle pagination; no offset/maxCount needed
          state: "Created",
          filter: {},       // keep as-is; search can be added later if needed
        };

        const response = await fetch("/api/legal-identities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Failed to fetch pending applications");

        const json = await response.json();
        const payload = json?.data;                         // ResponseModel.data
        const items = Array.isArray(payload?.items) ? payload.items : [];

        // helper for submittedAt
        const toSubmittedAt = (item) => {
          if (item?.createdDate && item?.createdTime) {
            return `${item.createdDate} ${item.createdTime}`;
          }
          if (item?.created) {
            try {
              const d = new Date(item.created);
              return isNaN(d.getTime()) ? "" : d.toLocaleString();
            } catch {
              return "";
            }
          }
          return "";
        };

        // robust id/name/status mapping
        const formattedApps = items.slice(0, 6).map((app) => ({
          id: app?.id ?? app?.legalIdentity ?? app?.latestLegalId ?? app?.userName ?? "",
          name:
            app?.name ??
            ([app?.firstName, app?.lastName].filter(Boolean).join(" ") || "Unknown User"),
          submittedAt: toSubmittedAt(app),
          status: app?.state ?? app?.latestLegalIdState ?? "Created",
        })).filter(a => a.id); // drop entries without an id

        setApplications(formattedApps);
      } catch (error) {
        console.error("Error fetching pending applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }

    fetchPendingApplications();
  }, []); // load once

  return (
    <div className={`bg-[var(--brand-navbar)] backdrop-blur-lg rounded-xl border border-[var(--brand-border)] ${compact ? 'min-h-[294px] p-3 shadow-sm' : 'p-6 shadow-xl'}`}>
      <h2 className={`${compact ? 'mb-5 text-lg' : 'mb-4 text-2xl'} font-bold text-[var(--brand-text)]`}>{t?.pendingApplications?.title || 'Pending applications'}</h2>

      {loading ? (
        <p className="text-[var(--brand-text-secondary)] text-center">{t?.pendingApplications?.loading}</p>
      ) : applications.length === 0 ? (
        <p className="text-[var(--brand-text-secondary)] text-center">{t?.pendingApplications?.empty}</p>
      ) : (
        <ul className="divide-y divide-[var(--brand-border)]">
          {applications.map((app) => (
            <li
              onClick={() => handleNavigate(app.id)}
              key={app.id}
              className={`${compact ? 'py-3 px-2 text-base' : 'py-4 p-3'} flex cursor-pointer justify-between items-center hover:bg-[var(--brand-hover)] rounded-lg transition-all`}
            >
              <div>
                <p className="text-[var(--brand-text-secondary)] font-semibold">{app.name}</p>
                <p className={`text-[var(--brand-text-tertiary)] ${compact ? 'text-sm' : 'text-sm'}`}>{app.submittedAt}</p>
              </div>
              <span className={`bg-yellow-500 text-white rounded-full shadow-md ${compact ? 'px-3 py-1 text-sm' : 'px-4 py-1 text-sm'}`}>
                {statusMap[app.status?.toLowerCase()] || app.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
