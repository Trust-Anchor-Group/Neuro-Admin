"use client";
import { useState } from "react";
import Link from "next/link";
import { FaHome, FaChalkboardTeacher, FaUserGraduate, FaWallet, FaChevronDown } from "react-icons/fa"; // Example icons from React Icons

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: <FaHome />,
        label: "Home",
        href: "/admin",
        visible: ["admin", "customer-assets"],
      },
      {
        icon: <FaChalkboardTeacher />,
        label: "Manage Assets",
        dropdown: true,
        subItems: [
          { label: "Orders", href: "/assets/orders" },
          { label: "Monitor", href: "/assets/monitor" },
        ],
        visible: ["admin", "customer-assets"],
      },
      {
        icon: <FaUserGraduate />,
        label: "Access",
        href: "/list/access",
        visible: ["admin",],
      },
      {
        icon: <FaWallet />,
        label: "Smart Payments",
        href: "/list/payments",
        visible: ["admin"],
      },
     
    ],
  },
];

const Menu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible) {
              return (
                <div key={item.label} className="relative">
                  {/* Regular Menu Item */}
                  {!item.dropdown ? (
                    <Link
                      href={item.href}
                      className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-neuroBlueLight"
                    >
                      <div className="text-lg">{item.icon}</div>
                      <span className="hidden lg:block">{item.label}</span>
                    </Link>
                  ) : (
                    <div>
                      <div
                        className="flex items-center justify-between lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-neuroBlueLight cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-lg">{item.icon}</div>
                          <span className="hidden lg:block">{item.label}</span>
                        </div>
                        <FaChevronDown
                          className={`text-sm transition-transform ${dropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      </div>
                      {/* Dropdown Sub-Items */}
                      {dropdownOpen && (
                        <div className="ml-8 flex flex-col gap-2 mt-2">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              className="text-gray-500 text-sm py-1 hover:text-blue-500"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
