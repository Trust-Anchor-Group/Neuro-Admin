"use client";
import Menu from "@/components/shared/Menu";
import Navbar from "@/components/shared/Navbar";
import { MdOutlineDocumentScanner, MdOutlineSettings } from "react-icons/md";
import SessionPing from "@/components/SessionPing"

export default function DashboardLayout({ children }) {

    const menuItems = [
    
      {
        title: 'Access',
        icon: <MdOutlineDocumentScanner size={20} />,
        href:'/neuro-access',
        subItems: [
          { label: 'ID applications', href: '/neuro-access/id-application' },
          { label: 'Accounts', href: '/neuro-access/account' },
        ],
      },
      {
        title: 'Access\u00A0settings',
        icon: <MdOutlineSettings size={20} />,
        href: '/neuro-access/settings',
      },
    ]

  return (
    <>
      <SessionPing />
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col bg-white shadow-md border-r border-gray-200">
        <Menu menuItems={menuItems}/>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 overflow-y-auto flex flex-col">
        <Navbar />
        <div className="flex-1 pb-6">{children}</div>

      </div>
    </div>
    </>
  );
}
