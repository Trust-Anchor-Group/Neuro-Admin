const KPIsList = ({ indicators }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Key Performance Indicators
      </h3>
      <ul className="space-y-4">
        {Object.entries(indicators).map(([key, value], index) => (
          <li key={index} className="flex justify-between">
            <span className="text-gray-600">{key}</span>
            <span className="text-gray-800 font-semibold">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KPIsList;
