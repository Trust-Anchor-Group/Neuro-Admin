"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const DigitalAssetsTable = ({ assets }) => {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredAssets =
    filter === "all"
      ? assets
      : assets.filter((asset) => asset.status.toLowerCase() === filter);

  const totalItems = filteredAssets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(
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
    router.push(`/assets/${id}`);
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Facilities</h2>
        <div className="flex items-center gap-3">
          {["all", "active", "inactive"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all ${filter === status
                  ? status === "active"
                    ? "bg-green-500 text-white"
                    : status === "inactive"
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              onClick={() => handleFilterChange(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-sm border-collapse rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Asset Name</th>
            <th className="py-3 px-4">Address</th>
            <th className="py-3 px-4">Total Processed Carbon </th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAssets.map((asset, index) => (
            <tr
              key={asset.id}
              onClick={() => handleRowClick(asset.id)}
              className={`cursor-pointer transition-all ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 hover:shadow-md`}
            >
              <td className="py-3 px-4">{asset.id}</td>
              <td className="py-3 px-4">{asset.name}</td>
              <td className="py-3 px-4">{asset.address}</td>
              <td className="py-3 px-4">{asset.carbonProcessed}</td>
              <td className="py-3 px-4 flex items-center gap-2">
                {asset.status === "Active" ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
                <span
                  className={`font-bold ${asset.status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {asset.status}
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

export default DigitalAssetsTable;
