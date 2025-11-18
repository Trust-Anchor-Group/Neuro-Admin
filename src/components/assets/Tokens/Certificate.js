import Image from "next/image";

const Certificate = ({ certificateUrl }) => {
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Certificate</h3>
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Image
          src={certificateUrl}
          alt="Certificate"
          width={600}
          height={400}
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};

export default Certificate;
