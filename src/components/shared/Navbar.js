"use client";

import { useState, useEffect } from "react";
import { FaEnvelope, FaBullhorn, FaChevronDown } from "react-icons/fa";
import LogoutBtn from "../logoutBtn/LogoutBtn";

const generateAvatarUrl = (seed) => {
  return `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`;
};

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("neuroUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.avatar = generateAvatarUrl(parsedUser.name || "defaultUser"); 
      setUser(parsedUser);
    }
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    sessionStorage.removeItem("neuroUser"); 
    setUser(null);
  };

  return (
    <div className="flex items-center justify-between bg-white shadow-md p-4 rounded-lg border-b border-gray-200">
      {/* Left Section: Welcome Message */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full shadow-md" />
            <div>
              <p className="text-gray-700 font-semibold text-lg">Welcome back,</p>
              <p className="text-gray-900 font-bold text-xl">{user.name} 👋</p>
            </div>
          </>
        ) : (
          <p className="text-gray-600 font-medium">Welcome to Neuro-Access</p>
        )}
      </div>

      {/* Icons and User Dropdown */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative group cursor-pointer">
          <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full w-10 h-10 flex items-center justify-center">
            <FaEnvelope className="text-gray-600 text-lg" />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </div>

        {/* Announcements */}
        <div className="relative group cursor-pointer">
          <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full w-10 h-10 flex items-center justify-center">
            <FaBullhorn className="text-gray-600 text-lg" />
          </div>
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <div
            onClick={toggleDropdown}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-2 cursor-pointer"
          >
            <img src={user?.avatar} alt="User Avatar" className="w-8 h-8 rounded-full shadow-sm" />
            <span className="text-gray-700 font-medium hidden md:block">{user?.name?.split(" ")[0] || "User"}</span>
            <FaChevronDown className="text-gray-500 text-sm transition-transform" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
              <ul className="py-2">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">Profile</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">Settings</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700" onClick={handleLogout}>
                  <LogoutBtn>Logout</LogoutBtn>
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
