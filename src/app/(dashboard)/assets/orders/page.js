import AssetOrdersTable from "@/components/assets/orders/AssetOrdersTable";
import { Suspense } from "react";
import { fetchOrders } from "@/lib/fetchOrders"; 

export default async function OrdersPage() {
  const ordersData = await fetchOrders(); 

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-blue-50 min-h-screen">
      <h1 className="p-3 text-3xl font-bold text-gray-800">Asset Orders</h1>
      <Suspense fallback={<p>Loading orders...</p>}>
        <AssetOrdersTable orders={ordersData.orders} isLoading={ordersData.loading} />
      </Suspense>
    </div>
  );
}
