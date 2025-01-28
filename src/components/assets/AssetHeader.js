const AssetHeader = ({ name }) => {
  return (
    <div className="flex items-center gap-4 bg-white shadow rounded-lg p-6 mb-8">
      <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
        <span className="text-2xl font-bold">{name[0]}</span>
      </div>
      <h1 className="text-3xl font-semibold text-gray-800">{name}</h1>
    </div>
  );
};

export default AssetHeader;
