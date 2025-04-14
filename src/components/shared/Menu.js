"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHome, FaRegUser, FaCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";

const menuItems = [
  {
    title: "Access",
    icon: <FaRegUser size={20} />,
    subItems: [
      { label: "ID applications", href: "/list/access/pending-ids" },
      { label: "Accounts", href: "/list/access" },
    ],
  },
  {
    title: "Access settings",
    icon: <FaCog size={20} />,
    href: "/settings",
  },
];

const Menu = () => {
  const [open, setOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div
      className={`h-screen bg-white shadow-md border-r border-gray-200 transition-all duration-300 flex flex-col justify-between ${
        open ? "w-64" : "w-16"
      }`}
    >
      <div>
        <div className="flex flex-col items-center px-3 py-4 border-b relative">
          <Image src="/neuroAdminLogo.svg" alt="Logo" width={48} height={48} />
          {open && (
            <div className="mt-4 w-full px-2">
              <div className="bg-gray-50 p-2 rounded-lg text-sm text-center">
                <span className="font-semibold">Neuro Admin</span>
                <div className="text-xs text-gray-400">Access</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className={`absolute top-[70px] ${
              open ? "-right-3" : "right-1/2 translate-x-1/2"
            } bg-gray-100 text-purple-600 rounded p-1 shadow z-20`}
          >
            {open ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
          </button>
        </div>

      <nav className="mt-6 px-2">
  {menuItems.map((item, idx) => (
    <div
      key={item.title}
      className="relative"
      onMouseEnter={() => setHoveredItem(idx)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      {item.href ? (
        // Wrap the entire clickable area with Link for items with href
        <Link
          href={item.href}
          className="flex items-center gap-3 py-3 px-2 text-gray-700 rounded hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all"
        >
          <span className="text-lg text-gray-600">{item.icon}</span>
          {open && <span className="text-sm font-medium">{item.title}</span>}
        </Link>
      ) : (
        // Render as a div for items with subItems
        <div className="flex items-center gap-3 py-3 px-2 text-gray-700 rounded hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all">
          <span className="text-lg text-gray-600">{item.icon}</span>
          {open && <span className="text-sm font-medium">{item.title}</span>}
        </div>
      )}

      {item.subItems && open && (
        <div className="ml-8 text-sm flex flex-col gap-1">
          {item.subItems.map((subItem) => (
            <Link
              key={subItem.label}
              href={subItem.href}
              className="py-1 px-2 rounded hover:bg-gray-200 text-gray-600 transition"
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      )}

      {item.subItems && !open && hoveredItem === idx && (
        <div
          className="absolute left-full top-0 bg-white shadow-lg rounded-lg text-sm p-2 z-30 ml-0"
          style={{ pointerEvents: "auto" }}
          onMouseEnter={() => setHoveredItem(idx)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="font-semibold text-purple-600 pb-1 border-b mb-1">
            {item.title}
          </div>
          {item.subItems.map((subItem) => (
            <Link
              key={subItem.label}
              href={subItem.href}
              className="block py-1 px-2 rounded hover:bg-gray-200 text-gray-600 transition whitespace-nowrap"
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      )}

      {!item.subItems && !open && hoveredItem === idx && (
        <div
          className="absolute left-full top-0 bg-white shadow-md rounded-lg text-sm p-2 z-30 ml-0"
          style={{ marginLeft: "0px" }}
        >
          <Link
            href={item.href}
            className="block py-1 px-2 rounded hover:bg-gray-200 text-purple-600 transition whitespace-nowrap font-semibold"
          >
            {item.title}
          </Link>
        </div>
      )}

      {/* Bottom divider for the last menu item */}
      {idx === menuItems.length - 1 && <div className="border-b border-gray-200 my-2"></div>}
    </div>
  ))}
</nav>
      </div>
   <Link href="/neuro-access" className="p-4 flex items-center justify-center">
      <div className="mb-4 px-4 flex justify-center">
        <Image src="/NeuroLogo.svg" alt="Neuro Logo" width={open ? 80 : 32} height={open ? 80 : 32} />
      </div>
      </Link>
    </div>
  );
};

export default Menu;
