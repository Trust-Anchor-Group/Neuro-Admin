"use client";
import { useState } from "react";
import { FaSearch, FaEnvelope, FaBullhorn, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex items-center justify-between bg-white shadow-md p-4 rounded-lg">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-sm bg-gray-100 rounded-full px-4 py-2 ring-1 ring-gray-300">
        <FaSearch className="text-gray-500 text-base" /> {/* Search Icon */}
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] bg-transparent outline-none text-gray-700"
        />
      </div>

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6">
        {/* Envelope Icon */}
        <div className="relative group">
          <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full w-10 h-10 flex items-center justify-center cursor-pointer">
            <FaEnvelope className="text-gray-600 text-lg" />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </div>

        {/* Announcement Icon */}
        <div className="relative group">
          <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full w-10 h-10 flex items-center justify-center cursor-pointer">
            <FaBullhorn className="text-gray-600 text-lg" />
          </div>
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        </div>

        {/* User Info with Dropdown */}
        <div className="relative">
          <div
            onClick={toggleDropdown}
            className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <FaUserCircle className="text-gray-600 text-2xl" />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
              <ul className="py-2">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                  onClick={() => console.log("Navigate to Profile")}
                >
                  Profile
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                  onClick={() => console.log("Navigate to Help")}
                >
                  Help
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                  onClick={() => console.log("Logout")}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
