"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaTimesCircle, FaShippingFast, FaClock } from "react-icons/fa";

const AssetOrdersTable = ({ orders }) => {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status.toLowerCase() === filter);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleFilterChange = (status) => {
    setFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowClick = (id) => {
    router.push(`/assets/orders/${id}`);
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-8">
      {/* Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Creturner Carbon Credit Orders</h2>
        <div className="flex items-center gap-3">
          {["all", "pending", "shipped", "delivered", "cancelled"].map(
            (status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all ${filter === status
                    ? status === "pending"
                      ? "bg-yellow-500 text-white"
                      : status === "shipped"
                        ? "bg-blue-500 text-white"
                        : status === "delivered"
                          ? "bg-green-500 text-white"
                          : status === "cancelled"
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                onClick={() => handleFilterChange(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-sm border-collapse rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-3 px-4">Order ID</th>
            <th className="py-3 px-4">Asset Name</th>
            <th className="py-3 px-4">Customer</th>
            <th className="py-3 px-4">Order Date</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order, index) => (
            <tr
              key={order.id}
              onClick={() => handleRowClick(order.id)}
              className={`cursor-pointer transition-all ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 hover:shadow-md`}
            >
              <td className="py-3 px-4">{order.id}</td>
              <td className="py-3 px-4">{order.assetName}</td>
              <td className="py-3 px-4">{order.customer}</td>
              <td className="py-3 px-4">{order.orderDate}</td>
              <td className="py-3 px-4">{order.amount}</td>
              <td className="py-3 px-4 flex items-center gap-2">
                {order.status === "delivered" ? (
                  <FaCheckCircle className="text-green-500" />
                ) : order.status === "shipped" ? (
                  <FaShippingFast className="text-blue-500" />
                ) : order.status === "cancelled" ? (
                  <FaTimesCircle className="text-red-500" />
                ) : (
                  <FaClock className="text-yellow-500" />
                )}
                <span
                  className={`font-bold ${order.status === "delivered"
                      ? "text-green-600"
                      : order.status === "shipped"
                        ? "text-blue-600"
                        : order.status === "cancelled"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded-md font-medium shadow-md transition-all ${currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssetOrdersTable;
