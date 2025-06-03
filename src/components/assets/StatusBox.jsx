import React from 'react'

export const StatusBox = ({statusCard}) => {
  return (
    <div className="bg-white shadow-sm rounded-xl border p-4 w-full max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Status</h3>
        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
          {statusCard.status}
        </span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">{statusCard.progress}% complete</span>
        <span className="text-gray-500 text-sm">{statusCard.amount}</span>
      </div>
      <div className="w-full bg-purple-100 rounded-full h-2.5">
        <div
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${statusCard.progress}%` }}
        />
      </div>
    </div>
  );
};

