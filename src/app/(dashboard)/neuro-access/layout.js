"use client";
import Menu from "@/components/shared/Menu";
import Navbar from "@/components/shared/Navbar";
import { MdOutlineDocumentScanner, MdOutlineSettings } from "react-icons/md";
import SessionPing from "@/components/SessionPing";
import { useLanguage, content } from '../../../../context/LanguageContext'

export default function DashboardLayout({ children }) {
  const { language } = useLanguage();
  const t = content[language];

  const menuItems = [
    {
      title: t?.menu?.access || 'Access',
      icon: <MdOutlineDocumentScanner size={20} />,
      href: '/neuro-access',
      subItems: [
        { label: t?.menu?.idApplications || 'ID applications', href: '/neuro-access/id-application' },
        { label: t?.menu?.accounts || 'Accounts', href: '/neuro-access/account' },
      ],
    },
    {
      title: t?.menu?.accessSettings || 'Access settings',
      icon: <MdOutlineSettings size={20} />,
      href: '/neuro-access/settings',
    },
  ];

  return (
    <>
      <SessionPing />
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col bg-white shadow-md border-r border-[var(--brand-border)]">
        <Menu menuItems={menuItems}/>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[var(--brand-background)] overflow-y-auto flex flex-col">
        <Navbar />
        <div className="flex-1 pb-6">{children}</div>

      </div>
    </div>
    </>
  );
}
