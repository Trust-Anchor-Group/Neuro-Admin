"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHome,FaRegUser , FaIdCard, FaUserShield, FaCog, FaChevronDown } from "react-icons/fa";

const menuItems = [
  {
    title: "Neuro-Access",
    items: [
      {
        icon: <FaHome size={20} />,
        label: "Home",
        href: "/neuro-access",
        visible: ["admin", "customer-assets"],
      },
      {
        icon: <FaRegUser   size={20} />,
        label: "Accounts",
        href: "/list/access",
        visible: ["admin"],
      },
      
      // {
      //   icon: <FaIdCard size={20} />,
      //   label: "Identity Management",
      //   href: "/list/access/admin",
      //   visible: ["admin"],
      // },
      {
        icon: <FaCog size={20} />,
        label: "Settings",
        href: "/settings",
        visible: ["admin"],
      },
    ],
  },
];

const Menu = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="mt-10 text-base font-semibold">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-3" key={section.title}>
          {/* Section Title */}
          {/* <span className="text-gray-600 font-bold uppercase text-xs px-6 tracking-wider">
            {section.title}
          </span> */}

          {section.items.map((item, itemIndex) => (
            <div key={item.label} className="relative">
              {/* Regular Menu Item */}
              {!item.dropdown ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-4 text-gray-700 px-3 py-3 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-200"
                >
                  <div className="text-xl text-gray-600 group-hover:text-white">{item.icon}</div>
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              ) : (
                <div>
                  {/* Dropdown Trigger */}
                  <div
                    className="flex items-center justify-between px-6 py-3 rounded-lg text-gray-700 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                    onClick={() => toggleDropdown(itemIndex)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-xl text-gray-600 group-hover:text-white">{item.icon}</div>
                      <span className="hidden lg:block">{item.label}</span>
                    </div>
                    <FaChevronDown
                      className={`text-sm transition-transform ${openDropdown === itemIndex ? "rotate-180" : ""}`}
                    />
                  </div>

                  {/* Dropdown Sub-Items */}
                  {openDropdown === itemIndex && (
                    <div className="ml-6 flex flex-col gap-2 mt-2 bg-gray-100 rounded-lg p-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="text-gray-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-300 transition"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;
