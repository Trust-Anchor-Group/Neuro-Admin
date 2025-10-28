import AssetOrdersTable from "@/components/assets/orders/AssetOrdersTable";
import { Suspense } from "react";
import { fetchOrders } from "@/lib/fetchOrders";

export default async function OrdersPage() {
  const ordersData = await fetchOrders();

  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <h1 className="p-3 text-3xl font-bold text-[var(--brand-text)]">Asset Orders</h1>

      <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">Loading orders...</p>}>
        <AssetOrdersTable orders={ordersData.orders} isLoading={ordersData.loading} />
      </Suspense>
    </div>
  );
}
