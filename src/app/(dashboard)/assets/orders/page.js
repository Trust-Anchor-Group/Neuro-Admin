import AssetOrdersTable from "@/components/assets/orders/AssetOrdersTable";
import TokensFetcher from "@/components/assets/orders/TokensFetcher";

const OrdersPage = () => {
  const assetOrders = [
    {
      id: 100,
      assetName: "Creturner Carbon Credit",
      customer: "Eliot Colegate",
      orderDate: "2025-01-15",
      amount: "$25,000",
      status: "pending",
    },
    {
      id: 101,
      assetName: "Creturner Carbon Credit",
      customer: "GreenCorp Ltd.",
      orderDate: "2025-01-15",
      amount: "$15,000",
      status: "pending",
    },
    {
      id: 102,
      assetName: "Creturner Carbon Credit",
      customer: "EcoInvest",
      orderDate: "2025-01-14",
      amount: "$25,000",
      status: "shipped",
    },
    {
      id: 103,
      assetName: "Creturner Carbon Credit",
      customer: "CleanFuture Solutions",
      orderDate: "2025-01-10",
      amount: "$10,000",
      status: "delivered",
    },
    {
      id: 104,
      assetName: "Creturner Carbon Credit",
      customer: "RenewEco Systems",
      orderDate: "2025-01-08",
      amount: "$8,500",
      status: "cancelled",
    },
  ];
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-blue-50 min-h-screen">
      <h1 className="p-3 text-3xl font-bold text-gray-800">Asset Orders</h1>
      <AssetOrdersTable orders={assetOrders} />
      <TokensFetcher />
    </div>
  );
};

export default OrdersPage;
