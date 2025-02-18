import { BsThreeDots } from "react-icons/bs";

const UserCard = ({ type }) => {
  return (
    <div className="rounded-2xl bg-white shadow-lg p-6 flex-1 min-w-[200px] transition-transform transform hover:scale-105">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] bg-green-100 text-green-600 px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
          This Month {type}
        </span>
        {/* More Icon */}
        <BsThreeDots className="text-gray-400 text-xl cursor-pointer hover:text-gray-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">1,234</h1>
      <h2 className="text-md font-medium text-gray-500 capitalize">{type}</h2>
    </div>
  );
};

export default UserCard;
