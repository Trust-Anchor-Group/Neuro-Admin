"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaEnvelope, FaBullhorn, FaChevronDown, FaUser, FaTachometerAlt, FaSignOutAlt, FaThLarge } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { LinkToPage } from "./LinkToPage";
import { fetchUserImage } from "@/utils/fetchUserImage";

// const generateAvatarUrl = (seed) => {
//   return `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`;
// };

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const router = useRouter();
  const isFetchingRef = useRef(false)

   useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("neuroUser");
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
    
        setUser(parsedUser);
  
        fetchUserImage(parsedUser?.pictureId).then((imageUrl) => {
          if (imageUrl) {
            setAvatarUrl(imageUrl);
          } else {
            // fallback to generated avatar
            const fallback = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(parsedUser.name || "defaultUser")}`;
            setAvatarUrl(fallback);
          }
        });
      }
    } catch (error) {
      throw new Error('Error in fetching Navbar image',error)
    } finally{
      isFetchingRef.current = false
    }

  }, []);

  const filterRef = useRef(null)

    useEffect(() => {
      
      const handleClickOutSide = (e) => {
        if(filterRef.current && !filterRef.current.contains(e.target)){
          setDropdownOpen(false)
        }
      }
  
      document.addEventListener('mousedown',handleClickOutSide)
  
      return () => {
        document.removeEventListener('mousedown',handleClickOutSide)
      }
  
    }, [])

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    router.push('/api/auth/logout');
    sessionStorage.removeItem("neuroUser"); 
    setUser(null);
     
  };

  return (
    <div className="flex items-center justify-between bg-white shadow-md p-4 border-b border-gray-200">
      {/* Left Section: Welcome Message */}
      <div className="flex items-center gap-3">
        {/* {user ? (
          <>
          {avatarUrl && (
            <Image src={avatarUrl} alt="User Avatar" width={32} height={32}  className="w-10 h-10 rounded-full shadow-md" />
          )}
            <div>
              <p className="text-gray-700 font-semibold text-lg">Welcome back,</p>
              <p className="text-gray-900 font-bold text-xl">{user.name} 👋</p>
            </div>
          </>
        ) : (
          <p className="text-gray-600 font-medium">Welcome to Neuro-Access</p>
        )} */}
      </div>

      {/* Icons and User Dropdown */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        {/* <div className="relative group cursor-pointer">
          <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full w-10 h-10 flex items-center justify-center">
            <FaEnvelope className="text-gray-600 text-lg" />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </div> */}

        {/* Announcements */}
        {/* <div className="relative group cursor-pointer">
          <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full w-10 h-10 flex items-center justify-center">
            <FaBullhorn className="text-gray-600 text-lg" />
          </div>
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        </div> */}

        {/* User Dropdown */}
        <div ref={filterRef} className="relative pr-5">
          <div
            onClick={toggleDropdown}
            className="flex items-center gap-2   cursor-pointer"
          
          >
             {avatarUrl && (
           <Image src={avatarUrl} alt="User Avatar" width={32} height={32} className="rounded-full shadow-sm" />
          )}

            <span className="text-gray-700 font-medium hidden md:block">{user?.name?.split(" ")[0] || "User"}</span>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg animate-fade-in rounded-lg z-50">
              <ul className="">
                {/* <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">Profile</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">Settings</li> */}
                <LinkToPage hrefName={`/neuro-access/profile/${user?.legalId}`} setToggle={setDropdownOpen} title={'Profile'} icon={<FaUser />}/>
                <LinkToPage handleLogout={handleLogout} title={'Logout'} icon={<FaSignOutAlt />}/>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
