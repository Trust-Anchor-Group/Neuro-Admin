"use client";

import React from "react";
import IssuerAccountsManager from "@/components/assets/IssuerAccountsManager";

export default function IssuerAdminPage() {
  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 bg-[var(--brand-background)] text-[var(--brand-text)] min-h-screen">
      <header>
        <h1 className="text-3xl font-bold">Issuer Administration</h1>
        <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
          Manage issuer-user account assignments in a dedicated workspace.
        </p>
      </header>

      <IssuerAccountsManager />
    </div>
  );
}
