import { fetchOrders } from "@/lib/fetchOrders";
import AssetsPageClient from "@/components/assets/AssetsPageClient";

// Server Component wrapper: fetch data on the server, pass to client component.
export default async function AssetsPage() {
  const ordersData = await fetchOrders();
  return <AssetsPageClient ordersData={ordersData} />;
}
