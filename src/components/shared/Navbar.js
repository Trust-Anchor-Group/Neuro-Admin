"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaEnvelope, FaBullhorn, FaChevronDown, FaUser, FaTachometerAlt, FaSignOutAlt, FaThLarge } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { LinkToPage } from "./LinkToPage";

// const generateAvatarUrl = (seed) => {
//   return `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(seed)}`;
// };
const fetchUserImage = async (legalId) => {
  try {
    const response = await fetch("/api/legalIdPicture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legalId }),
    });

    if (!response.ok) throw new Error("Failed to fetch user image");

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching user image:", error);
    return null;
  }
};

const Navbar = ({ neuroLogo }) => {
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
    <div className="relative z-20 flex items-center justify-between bg-white shadow-md p-4 rounded-lg border-b border-gray-200">

      {/* Left Section: Welcome Message */}
      {neuroLogo && (
        <Image src="/NeuroLogo.svg" alt="Neuro" width={80} height={80}  />
      )}
      <div className="flex items-center gap-3">
       
      </div>

      {/* Icons and User Dropdown */}
      <div className="flex items-center gap-6">
       
        {/* User Dropdown */}
        <div ref={filterRef} className="relative">
          <div
            onClick={toggleDropdown}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-2 cursor-pointer"
          
          >
             {avatarUrl && (
           <Image src={avatarUrl} alt="User Avatar" width={32} height={32} className="rounded-full shadow-sm" />
          )}

            <span className="text-gray-700 font-medium hidden md:block">{user?.name?.split(" ")[0] || "User"}</span>
            <FaChevronDown className="text-gray-500 text-sm transition-transform" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg z-50">
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
