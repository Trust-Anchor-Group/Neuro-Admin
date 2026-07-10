"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const savedKycStorageKey = "neuro-admin-my-kycs";

export default function MyKYCPage() {
  const [savedKycs, setSavedKycs] = useState([]);
  const [kycToDelete, setKycToDelete] = useState(null);

  useEffect(() => {
    setSavedKycs(JSON.parse(window.localStorage.getItem(savedKycStorageKey) || "[]"));
  }, []);

  const deleteKyc = () => {
    if (!kycToDelete) return;

    const nextKycs = savedKycs.filter((kyc) => kyc.id !== kycToDelete.id);
    window.localStorage.setItem(savedKycStorageKey, JSON.stringify(nextKycs));
    setSavedKycs(nextKycs);
    setKycToDelete(null);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--brand-background)]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-navbar)] px-8">
        <h1 className="text-[25px] font-bold leading-none text-[var(--brand-text)]">My KYC</h1>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-lg leading-none text-gray-500">
          <span>Home</span>
          <span aria-hidden="true">&gt;</span>
          <span>Settings</span>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-500">My KYC</span>
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-8 pb-8 pt-5">
        {savedKycs.length > 0 ? (
          <section className="flex min-h-0 flex-1 flex-col">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-[var(--brand-text)]">Your KYCs</h2>
                <p className="mt-2 text-lg text-[var(--brand-text-secondary)]">
                  Manage the KYC flows you have created.
                </p>
              </div>
              <Link
                href="/neuro-access/settings/my-kyc/create"
                className="inline-flex h-[52px] shrink-0 items-center justify-center gap-3 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-7 text-lg font-semibold text-white shadow-sm transition-colors hover:brightness-95"
              >
                <Plus className="h-6 w-6" />
                Create
              </Link>
            </div>

            <div className="grid gap-4 overflow-y-auto pr-2 lg:grid-cols-2 xl:grid-cols-3">
              {savedKycs.map((kyc) => {
                const fieldCount = kyc.groups.reduce((count, group) => count + group.fields.length, 0);

                return (
                  <article
                    key={kyc.id}
                    className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-bold text-[var(--brand-text)]">{kyc.name}</h3>
                        <p className="mt-2 line-clamp-2 text-base text-[var(--brand-text-secondary)]">
                          {kyc.description || "No description added."}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] px-3 py-1 text-sm font-bold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]">
                        {kyc.groups.length}
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[var(--brand-border)] pt-4 text-sm font-semibold text-[var(--brand-text-secondary)]">
                      <span>{fieldCount} fields</span>
                      <span>{new Date(kyc.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-5 flex items-center justify-end gap-2">
                      <Link
                        href={`/neuro-access/settings/my-kyc/create?edit=${kyc.id}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--brand-border)] bg-white text-[var(--brand-text-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                        aria-label={`Edit ${kyc.name}`}
                        title="Edit KYC"
                      >
                        <Pencil className="h-5 w-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setKycToDelete(kyc)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--brand-border)] bg-white text-[#d11f3f] transition-colors hover:border-[#d11f3f] hover:bg-[#fff1f3]"
                        aria-label={`Delete ${kyc.name}`}
                        title="Delete KYC"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-10 py-12 text-center">
            <div className="max-w-3xl">
              <p className="mb-4 text-lg font-semibold text-[var(--brand-primary)]">Welcome</p>
              <h2 className="text-[42px] font-bold leading-tight text-[var(--brand-text)]">
                Build your own KYC
              </h2>
              <p className="mt-5 text-xl leading-relaxed text-[var(--brand-text-secondary)]">
                Welcome to My KYC. This is where you can start building and shaping your own KYC flow for the information you need to collect.
              </p>
              <Link
                href="/neuro-access/settings/my-kyc/create"
                className="mt-10 inline-flex h-[52px] items-center justify-center gap-3 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-8 text-lg font-semibold text-white shadow-sm transition-colors hover:brightness-95"
              >
                <Plus className="h-6 w-6" />
                Create New KYC
              </Link>
            </div>
          </section>
        )}
      </div>

      {kycToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-text)]">Delete KYC?</h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--brand-text-secondary)]">
                  Are you sure you want to delete “{kycToDelete.name}”? This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setKycToDelete(null)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] text-[var(--brand-text-secondary)] transition-colors hover:bg-[var(--brand-background)]"
                aria-label="Close delete warning"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setKycToDelete(null)}
                className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--brand-border)] px-5 text-base font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-background)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteKyc}
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#d11f3f] px-5 text-base font-semibold text-white shadow-sm transition-colors hover:brightness-95"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
