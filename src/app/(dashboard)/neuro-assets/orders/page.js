import AssetOrdersTable from "@/components/assets/orders/AssetOrdersTable";
import { Suspense } from "react";
import { fetchOrders } from "@/lib/fetchOrders"; 
import { Award, Activity, Users, Timer } from "lucide-react";


export default async function OrdersPage() {
  const ordersData = await fetchOrders();

    const summaryCards = [
      {
        label: "Total",
        value: "450 ton",
        Icon: Award,
        accentClass: "text-emerald-500 bg-emerald-100",
      },
      {
        label: "Active orders",
        value: "6",
        Icon: Activity,
        accentClass: "text-blue-500 bg-blue-100",
      },
      {
        label: "Pending orders",
        value: "4",
        Icon: Timer,
        accentClass: "text-amber-500 bg-amber-100",
      },
    ];

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <h1 className="p-3 text-3xl font-bold text-[var(--brand-text)]">Asset Orders</h1>
      <section className="mt-4 mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(({ label, value, Icon, accentClass }) => (
          <div
            key={label}
            className="flex flex-col rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm backdrop-blur"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{label}</p>
              <span
                className={`inline-flex items-center justify-center rounded-full p-2 ${accentClass}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-[var(--brand-text)]">{value}</p>
          </div>
        ))}
      </section>
      <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">Loading orders...</p>}>
        <AssetOrdersTable orders={ordersData.orders} isLoading={ordersData.loading} />
      </Suspense>
    </div>
  );
}
