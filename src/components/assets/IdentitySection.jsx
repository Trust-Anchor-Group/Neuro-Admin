import React from "react";

const IdentitySection = ({ title, note, children, subdued = false }) => {
  return (
    <section
      className={`rounded-xl p-4 ${
        subdued
          ? "border border-dashed border-[var(--brand-border)] bg-[var(--brand-background)]"
          : "border border-[var(--brand-border)] bg-[var(--brand-navbar)]/70"
      }`}
    >
      <header className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--brand-text)]">{title}</p>
        {note ? (
          <span className="text-xs text-[var(--brand-text-secondary)]">{note}</span>
        ) : null}
      </header>
      {children}
    </section>
  );
};

export default IdentitySection;
