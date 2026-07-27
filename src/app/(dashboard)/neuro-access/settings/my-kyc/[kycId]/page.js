"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Layers3, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const savedKycStorageKey = "neuro-admin-my-kycs";

export default function SavedKYCPage() {
  const params = useParams();
  const kycId = params?.kycId;
  const [savedKycs, setSavedKycs] = useState([]);

  useEffect(() => {
    setSavedKycs(JSON.parse(window.localStorage.getItem(savedKycStorageKey) || "[]"));
  }, []);

  const kyc = useMemo(
    () => savedKycs.find((savedKyc) => savedKyc.id === kycId),
    [kycId, savedKycs]
  );

  const totalFields = useMemo(
    () => kyc?.groups.reduce((count, group) => count + group.fields.length, 0) || 0,
    [kyc]
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--brand-background)]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-navbar)] px-8">
        <h1 className="text-[25px] font-bold leading-none text-[var(--brand-text)]">My KYC</h1>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-lg leading-none text-gray-500">
          <span>Home</span>
          <span aria-hidden="true">&gt;</span>
          <span>Settings</span>
          <span aria-hidden="true">&gt;</span>
          <Link href="/neuro-access/settings/my-kyc" className="transition-colors hover:text-[var(--brand-primary)]">
            My KYC
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-500">{kyc?.name || "KYC"}</span>
        </nav>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <Link
          href="/neuro-access/settings/my-kyc"
          className="mb-5 inline-flex items-center gap-2 text-base font-semibold text-[var(--brand-text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to My KYC
        </Link>

        {!kyc ? (
          <section className="flex min-h-[420px] items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-8 text-center shadow-sm">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold text-[var(--brand-text)]">KYC not found</h2>
              <p className="mt-3 text-lg text-[var(--brand-text-secondary)]">
                This saved KYC could not be found in your browser storage.
              </p>
              <Link
                href="/neuro-access/settings/my-kyc/create"
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-7 text-lg font-semibold text-white shadow-sm transition-colors hover:brightness-95"
              >
                <Plus className="h-5 w-5" />
                Create KYC
              </Link>
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-7 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0">
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                    Saved KYC
                  </p>
                  <h2 className="break-words text-4xl font-bold leading-tight text-[var(--brand-text)]">
                    {kyc.name}
                  </h2>
                  <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[var(--brand-text-secondary)]">
                    {kyc.description || "No description added."}
                  </p>
                </div>
                <Link
                  href="/neuro-access/settings/my-kyc/create"
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-6 text-lg font-semibold text-white shadow-sm transition-colors hover:brightness-95"
                >
                  <Plus className="h-5 w-5" />
                  Create new
                </Link>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-[var(--brand-border)] bg-white p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--brand-text)]">{kyc.groups.length}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--brand-text-secondary)]">Pages</p>
                </div>
                <div className="rounded-lg border border-[var(--brand-border)] bg-white p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--brand-text)]">{totalFields}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--brand-text-secondary)]">Fields</p>
                </div>
                <div className="rounded-lg border border-[var(--brand-border)] bg-white p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--brand-text)]">
                    {new Date(kyc.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--brand-text-secondary)]">Created</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {kyc.groups.map((group) => (
                <article
                  key={group.title}
                  className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--brand-border)] pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--brand-text)]">{group.title}</h3>
                      {group.description && (
                        <p className="mt-1 text-sm leading-relaxed text-[var(--brand-text-secondary)]">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] px-3 py-1 text-sm font-bold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]">
                      {group.fields.length} fields
                    </span>
                  </div>

                  {group.fields.length > 0 ? (
                    <div className="space-y-3">
                      {group.fields.map((field) => (
                        <div
                          key={field.id}
                          className="rounded-md border border-[var(--brand-border)] bg-white px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-bold text-[var(--brand-text)]">{field.label}</p>
                              {field.description && (
                                <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
                                  {field.description}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-bold text-[#64748b]">
                              {field.type || field.inputType || "Field"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-[var(--brand-border)] bg-white px-4 py-6 text-center text-base font-semibold text-[var(--brand-text-secondary)]">
                      No fields selected for this page.
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
