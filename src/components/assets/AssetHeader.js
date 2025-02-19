import Image from 'next/image';

const AssetHeader = ({ name, logoSrc }) => {
  return (
    <div className="flex items-center gap-4 bg-white shadow rounded-lg p-6 mb-8">
      <div className="bg-white-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
        <Image src={logoSrc} alt={`${name} logo`} width={200} height={200} />
      </div>
      <h1 className="text-3xl font-semibold text-gray-800">{name}</h1>
     
    </div>
  );
};

export default AssetHeader;