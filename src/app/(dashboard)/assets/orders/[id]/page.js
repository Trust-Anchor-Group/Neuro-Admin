"use client";

import { useParams } from "next/navigation";
import Certificate from "@/components/assets/orders/Certificate";

const OrderDetailsPage = () => {
  const { id } = useParams();

  const orderDetails = {
    id,
    customer: "Eliot Colegate",
    orderDate: "2025-01-10",
    amount: "$10,000",
    compensation: "10,000 kg CO2",
    status: "Pending",
    certificateUrl: "/certificate.jpg",
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
    shipped: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Order #{orderDetails.id}</h1>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-gray-500">Customer</p>
            <p className="text-lg font-medium text-gray-800">{orderDetails.customer}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-gray-500">Order Date</p>
            <p className="text-lg font-medium text-gray-800">{orderDetails.orderDate}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-gray-500">Amount</p>
            <p className="text-lg font-medium text-gray-800">{orderDetails.amount}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-gray-500">Compensation</p>
            <p className="text-lg font-medium text-gray-800">{orderDetails.compensation}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-gray-500">Asset</p>
            <p className="text-lg font-medium text-gray-800">Creturner Carbon Credit</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-gray-500">Status</p>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${statusColors[orderDetails.status.toLowerCase()]}`}
            >
              {orderDetails.status}
            </span>
          </div>
        </div>

        {/* Certificate */}
        <Certificate certificateUrl={orderDetails.certificateUrl} />
      </div>
    </div>
  );
};

export default OrderDetailsPage;
