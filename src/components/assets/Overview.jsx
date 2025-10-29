import React from "react";
const Overview = () => {
  return (
    <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[var(--brand-text)]">Overview</h2>
      <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
        Overview tools coming soon. Configure client notifications, adjust compensation plans,
        and review access once the feature is connected.
      </p>
    </div>
  );
};
export default Overview;