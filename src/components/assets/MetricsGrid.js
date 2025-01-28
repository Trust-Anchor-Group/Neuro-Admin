const MetricsGrid = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`bg-white shadow-lg rounded-lg p-6 text-center border-l-4 border-${metric.color}-500`}
        >
          <h3 className={`text-2xl font-semibold text-${metric.color}-600`}>
            {metric.value}
          </h3>
          <p className="text-sm text-gray-500">{metric.label}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
