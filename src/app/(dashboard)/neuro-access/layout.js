"use client";

import Menu from "@/components/shared/Menu";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Image from "next/image";
import Link from "next/link";
import { FaCog, FaHome, FaRegUser, FaThLarge } from "react-icons/fa";

export default function DashboardLayout({ children }) {

    const menuItems = [
      {
        title:'Dashboard',
        icon:<FaThLarge/>,
        href:'/neuro-access',
      },
      {
        title: 'Access',
        icon: <FaRegUser size={20} />,
        subItems: [
          { label: 'ID applications', href: '/neuro-access/id-application' },
          { label: 'Accounts', href: '/neuro-access/account' },
        ],
      },
      {
        title: 'Access settings',
        icon: <FaCog size={20} />,
        href: '/neuro-access/settings',
      },
    ]

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col bg-white shadow-md border-r border-gray-200">
        <Menu menuItems={menuItems}/>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 overflow-y-auto flex flex-col">
        <Navbar />
        <div className="flex-1 pb-6">{children}</div>

        <Footer />
      </div>
    </div>
  );
}
