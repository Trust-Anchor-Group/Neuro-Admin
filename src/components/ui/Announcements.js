const Announcements = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Neuro Announcements</h1>
        <span className="text-sm text-blue-500 font-medium cursor-pointer hover:underline">
          View All
        </span>
      </div>

      {/* Announcements List */}
      <div className="flex flex-col gap-6 mt-6">
        {/* Announcement Item */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Lorem ipsum dolor sit</h2>
            <span className="text-xs text-gray-500 bg-white border border-gray-300 rounded-full px-2 py-1">
              2025-01-01
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum,
            expedita. Rerum, quidem facilis?
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Lorem ipsum dolor sit</h2>
            <span className="text-xs text-gray-500 bg-white border border-gray-300 rounded-full px-2 py-1">
              2025-01-01
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum,
            expedita. Rerum, quidem facilis?
          </p>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Lorem ipsum dolor sit</h2>
            <span className="text-xs text-gray-500 bg-white border border-gray-300 rounded-full px-2 py-1">
              2025-01-01
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum,
            expedita. Rerum, quidem facilis?
          </p>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
