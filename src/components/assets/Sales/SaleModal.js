"use client";

import { X } from "lucide-react";

const infoRowClass =
  "grid grid-cols-1 items-start gap-2 border-b border-[var(--brand-border)] px-3 py-2 sm:grid-cols-[1fr,1.4fr]";

function InfoRow({ label, value, href }) {
  const content = href ? (
    <a
      href={href}
      className="text-[var(--brand-primary,#7a5af5)] underline underline-offset-2 hover:text-[var(--brand-primary)]"
    >
      {value}
    </a>
  ) : (
    <span className="font-semibold text-[var(--brand-text)]">{value}</span>
  );

  return (
    <div className={infoRowClass}>
      <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{label}</p>
      <p className="text-sm">{content}</p>
    </div>
  );
}

function Avatar({ name }) {
  const initials = (name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary,#7a5af5)]/10 text-sm font-semibold text-[var(--brand-primary-text,#4D2C91)]">
      {initials || "?"}
    </div>
  );
}

export default function SaleModal({ sale, onClose }) {
  if (!sale) return null;

  const {
    assetName = "Token name",
    category = "Commodity",
    issuer = "EcoTech Solutions",
    buyer = "Anna Lindberg",
    orderDate = "2024-02-02, 15:29",
    amount = "180 kg",
    price = "2,045.00 EUR",
    paymentMethod = "Invoice",
    paymentDue = "2025-03-28",
    paymentReceived = "2025-03-26, 15:29",
  } = sale;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl max-h-2xl rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Avatar name={issuer} />
            <div>
              <p className="text-lg font-semibold text-[var(--brand-text)]">{issuer}</p>
              <p className="text-sm text-[var(--brand-text-secondary)]">Issuer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar name={buyer} />
            <div>
              <p className="text-lg font-semibold text-[var(--brand-text)]">{buyer}</p>
              <p className="text-sm text-[var(--brand-text-secondary)]">Buyer</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-4 rounded-full p-2 text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-background)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 pb-6">
          <section className="rounded-2xl bg-[var(--brand-background)] p-4">
            <h2 className="pb-3 text-sm font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
              Order details
            </h2>
            <div className="grid gap-2">
              <InfoRow label="Token name" value={assetName} />
              <InfoRow label="Token type" value={category} />
              <InfoRow label="Issuer" value={issuer} />
              <InfoRow label="Time of sale" value={orderDate} />
              <InfoRow label="Purchased by" value={buyer} />
            </div>
          </section>

          <section className="rounded-2xl bg-[var(--brand-background)] p-4">
            <h2 className="pb-3 text-sm font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
              Company information
            </h2>
            <div className="grid gap-2">
              <InfoRow label="Purchase amount" value={amount} />
              <InfoRow label="Purchase price" value={price} />
              <InfoRow label="Payment method" value={paymentMethod} />
              <InfoRow label="Payment due" value={paymentDue} />
              <InfoRow label="Payment received" value={paymentReceived} />
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="flex-1 rounded-2xl bg-[var(--brand-primary-light,#E1D1FF)] px-4 py-3 text-center text-sm font-semibold text-[var(--brand-primary-text,#4D2C91)] shadow-inner"
            >
              Manage sale
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl bg-red-100 px-4 py-3 text-center text-sm font-semibold text-red-600"
            >
              Issue refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
