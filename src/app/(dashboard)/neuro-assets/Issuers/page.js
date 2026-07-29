
import IssuerAccountsManager from "@/components/assets/IssuerAccountsManager";

export default function AssetsPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-background)] p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        <section className="min-h-[420px] rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[var(--brand-text)]">Issuer Accounts</h1>
        </section>

        <section className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[var(--brand-text)]">Link Issuers</h2>
          <div className="mt-6">
            <IssuerAccountsManager />
          </div>
        </section>
      </div>
    </div>
  );
}
