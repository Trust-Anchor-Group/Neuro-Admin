import React, { useState } from "react";
import { useLanguage, content as i18nContent } from "../../../context/LanguageContext";
import Image from "next/image";

const baseDetails = {
  clientType: "Organization",
  clientName: "EcoTech Solutions",
  identityNumber: "202100-5489",
  country: "US",
  address: "456 Oak Ave, San Francisco, CA 94102",
  originDate: "2009-03-28",
  email: "company@ecotechsolutions.com",
  phone: "+46 735 345 3648",
};

const identityCards = [
  {
    id: "pending",
    statusLabel: "Pending ID application",
    statusTone: "bg-neuroOrange/20 text-neuroDarkOrange",
    createdAt: "Created 2025-02-23",
    actions: [
      { label: "Deny ID application", tone: "bg-rose-100 text-rose-600" },
      { label: "Approve ID application", tone: "bg-purple-100 text-purple-600" },
    ],
    infoNote: "Last updated: 2025-02-24",
    metadata: [
      { label: "Requested flags:", value: "KYC, AML, ESG Bronze" },
      { label: "Education sources:", value: "Not provided" },
      { label: "Documents:", value: "3 pending verification" },
    ],
    details: baseDetails,
  },
  {
    id: "active",
    statusLabel: "Active ID",
    statusTone: "bg-neuroGreen/20 text-neuroGreen",
    createdAt: "Issued 2024-11-15",
    headerNote: "All checkpoints verified",
    actions: [
      { label: "Suspend ID", tone: "bg-rose-100 text-rose-600" },
      { label: "Obsolete ID", tone: "bg-purple-100 text-purple-600" },
    ],
    infoNote: "Last updated: 2025-01-18",
    metadata: [
      { label: "Last renewal", value: "2025-01-18 via automated workflow" },
      { label: "Compliance level", value: "ESG Silver" },
      { label: "Delegated admins", value: "2 active contacts" },
    ],
    details: baseDetails,
  },
  {
    id: "Obsoleted",
    statusLabel: "Obsoleted ID",
    statusTone: "bg-obsoletedRed/20 text-obsoletedRed",
    createdAt: "Obsoleted 2025-03-04",
    actions: [
    ],
    infoNote: "Last updated: 2025-03-04",
    metadata: [
      { label: "Suspension reason", value: "Detected anomaly in login pattern" },
      { label: "Escalation contact", value: "security@ecotechsolutions.com" },
      { label: "Required steps", value: "Multi-factor revalidation" },
    ],
    details: baseDetails,
  },
];

const Manage = () => {
  const { language } = useLanguage();
  const t = i18nContent[language]?.Manage || {};
  // track open identity sections per card id
  const [openIds, setOpenIds] = useState(() => new Set(identityCards.map(c => c.id))); // identity info open
  const [metadataOpenIds, setMetadataOpenIds] = useState(() => new Set(identityCards.map(c => c.id))); // metadata open
  const toggleId = (id) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleMetadataId = (id) => {
    setMetadataOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_50%]">
        <section className="space-y-6">
          {identityCards.map((card) => (
            <article
              key={card.id}
              className="relative overflow-hidden rounded-xl bg-[var(--brand-navbar)]"
            >
              <div className="relative flex h-full flex-col gap-6 rounded-xl bg-[var(--brand-background)]/95 p-6 sm:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-slate-50 shadow-inner">
                        <Image 
                        src='/neuroAdminLogo.svg' 
                        width={1200}
                        height={1200}
                        alt='neuroAdminLogo.svg' 
                        
                        className="h-12 w-12 object-contain" />
                      </div>
                      <div>
                        <span
                        className={`inline-flex items-center gap-2 self-start rounded-lg px-3 py-1 text-base font-semibold shadow-sm mb-3 ${card.statusTone}`}
                        >
                        {(() => {
                          const label = card.statusLabel;
                          // Map original English status to translation if available
                          const statusKey = label?.toLowerCase().includes('pending') ? 'pending'
                            : label?.toLowerCase().includes('active') ? 'active'
                            : label?.toLowerCase().includes('obsoleted') ? 'obsoleted'
                            : null;
                          return statusKey && t.statuses?.[statusKey] ? t.statuses[statusKey] : label;
                        })()}
                        </span>
                        <h3 className="text-2xl font-semibold text-[var(--brand-text)]">EcoTech Solutions</h3>
                        <p className="text-sm pb-2 mb-2 text-[var(--brand-text-secondary)] border-b-2 border-[var(--brand-border)]">ecotech_solutions#6834</p>
                        <p className="text-base font-medium text-[var(--brand-text-secondary)]">{card.createdAt}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <section className="overflow-hidden border-b border-[var(--brand-border)]">
                    <header className="flex items-center justify-between gap-3 border-b border-[var(--brand-border)] px-5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleId(card.id)}
                        className="flex w-full items-center justify-between text-left"
                        aria-expanded={openIds.has(card.id)}
                        aria-controls={`identity-info-${card.id}`}
                      >
                        <p className="text-sm font-semibold text-[var(--brand-text)] flex items-center gap-2">{t.sections?.identityInformation || 'Identity information'}</p>
                        <svg
                          aria-hidden="true"
                          className={`h-4 w-4 transform transition-transform duration-200 text-[var(--brand-text-secondary)] ${openIds.has(card.id) ? 'rotate-180' : ''}`}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </header>
                    {openIds.has(card.id) && (
                      <dl id={`identity-info-${card.id}`} className="divide-y divide-[var(--brand-border)] text-sm">
                        {[
                          { label: t.labels?.clientType || 'Client type:', value: card.details.clientType },
                          { label: t.labels?.clientName || 'Client name:', value: card.details.clientName },
                          { label: t.labels?.identityNumber || 'Identity number:', value: card.details.identityNumber },
                          { label: t.labels?.countryOfOrigin || 'Country of origin:', value: card.details.country },
                          { label: t.labels?.address || 'Address:', value: card.details.address },
                          { label: t.labels?.originDate || 'Origin date:', value: card.details.originDate },
                          { label: t.labels?.email || 'Email:', value: card.details.email },
                          { label: t.labels?.phoneNumber || 'Phone number:', value: card.details.phone },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="grid gap-2 px-5 py-4 sm:grid-cols-[160px_1fr] sm:items-start sm:gap-6"
                          >
                            <dt className="text-sm font-medium text-[var(--brand-text-secondary)]">{label}</dt>
                            <dd className="text-sm text-[var(--brand-text)]">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </section>

                  <section className="overflow-hidden border-b border-[var(--brand-border)]">
                    <header className="flex items-center justify-between gap-3 border-b border-[var(--brand-border)] px-5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleMetadataId(card.id)}
                        className="flex w-full items-center justify-between text-left"
                        aria-expanded={metadataOpenIds.has(card.id)}
                        aria-controls={`identity-metadata-${card.id}`}
                      >
                        <p className="text-sm font-semibold text-[var(--brand-text)] flex items-center gap-2">{t.sections?.identityMetadata || 'Identity metadata'}</p>
                        <svg
                          aria-hidden="true"
                          className={`h-4 w-4 transform transition-transform duration-200 text-[var(--brand-text-secondary)] ${metadataOpenIds.has(card.id) ? 'rotate-180' : ''}`}
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </header>
                    {metadataOpenIds.has(card.id) && (
                      <dl id={`identity-metadata-${card.id}`} className="divide-y divide-[var(--brand-border)]">
                        {card.metadata.map((meta) => {
                          // Attempt to map metadata label base (strip colon) to translation
                          const base = meta.label.replace(/:$/, '').toLowerCase().replace(/\s+/g, '');
                          const translationMap = {
                            requestedflags: t.metadata?.requestedFlags,
                            educationsources: t.metadata?.educationSources,
                            documents: t.metadata?.documents,
                            lastrenewal: t.metadata?.lastRenewal,
                            compliancelevel: t.metadata?.complianceLevel,
                            delegatedadmins: t.metadata?.delegatedAdmins,
                            suspensionreason: t.metadata?.suspensionReason,
                            escalationcontact: t.metadata?.escalationContact,
                            requiredsteps: t.metadata?.requiredSteps
                          };
                          const translatedLabel = translationMap[base] || meta.label;
                          return (
                            <div
                              key={meta.label}
                              className="grid gap-2 px-5 py-4 sm:grid-cols-[160px_1fr] sm:items-start sm:gap-6"
                            >
                              <dt className="text-sm font-medium text-[var(--brand-text-secondary)]">{translatedLabel}</dt>
                              <dd className="text-sm text-[var(--brand-text)]">{meta.value}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    )}
                  </section>
                </div>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
                  {card.actions.map((action) => {
                    const label = action.label.toLowerCase();
                    const baseButtonClasses =
                      "inline-flex min-w-[50%] items-center justify-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";

                      let appearance = " bg-white/80 text-[var(--brand-text)]";
                    if (label.includes("deny")) {
                      appearance =
                        "bg-obsoletedRed/20 text-obsoletedRed hover:bg-rose-100";
                    } else if (label.includes("approve")) {
                      appearance =
                        "bg-aprovedPurple/15 text-neuroPurpleDark hover:bg-purple-100";
                    } else if (label.includes("suspend")) {
                      appearance =
                        "bg-neuroDarkOrange/20 text-neuroDarkOrange hover:opacity-70 opacity-100";
                    } else if (label.includes("obsolete")) {
                      appearance =
                        "bg-obsoletedRed/20 text-obsoletedRed hover:bg-rose-100";
                    
                    }

                    const icon =
                      label.includes("deny") ? (
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 6L14 14M6 14L14 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : label.includes("approve") ? (
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.5 11L8.5 14L14.5 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : label.includes("obsolete") ? (
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 6L14 14M6 14L14 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : label.includes("suspend") ? (
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7 6H13M7 10H13M7 14H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      ) : null;

                    return (
                      <button key={action.label} type="button" className={`${baseButtonClasses} ${appearance}`}>
                        {icon}
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="rounded-xl h-fit bg-[var(--brand-navbar)] p-6">
          <h2 className="text-xl font-semibold text-[var(--brand-text)]">{t.pageTitle || 'Client activity'}</h2>
          <div className="mt-4 flex flex-row gap-4">
            <label className="relative flex items-center w-full">
              <svg
                className="absolute left-3 h-4 w-4 text-[var(--brand-text-secondary)]"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 11.5L14.5 14.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.5 8.5C12.5 10.9853 10.4853 13 8 13C5.51472 13 3.5 10.9853 3.5 8.5C3.5 6.01472 5.51472 4 8 4C10.4853 4 12.5 6.01472 12.5 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <input
                type="search"
                placeholder={t.searchPlaceholder || 'Search activity'}
                className="w-full rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] py-2 pl-9 pr-3 text-sm text-[var(--brand-text)] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-300"
              />
            </label>
            <button
              type="button"
              className="inline-flex w-[30%] items-center justify-between gap-2 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]"
            >
              <span>{t.filterAll || 'All'}</span>
              <svg
                className="h-4 w-4 text-[var(--brand-text-secondary)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
              </svg>
            </button>
          </div>

          <div className="mt-6 flex h-[550px] flex-col items-center justify-center rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] text-center">
            <p className="text-base font-medium text-[var(--brand-text-secondary)]">
              {t.comingSoon || 'Coming soon'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default Manage;