import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const PieChartComponent = ({ data, colors, title }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          {/* Pie Chart */}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            innerRadius={60}
            fill="#8884d8"
            paddingAngle={5}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false} // Remove lines connecting labels to slices
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>

          {/* Tooltip */}
          <Tooltip
            formatter={(value, name) => [`${value}`, `${name}`]}
            contentStyle={{
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              borderColor: "#dddddd",
              color: "#333333",
              padding: "8px",
            }}
          />

          {/* Legend */}
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "14px",
              color: "#555555",
            }}
            formatter={(value) => (
              <span className="text-gray-600 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
