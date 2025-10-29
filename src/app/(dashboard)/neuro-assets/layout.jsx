"use client";
import Menu from "@/components/shared/Menu";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { FaCog, FaRegFileAlt } from "react-icons/fa";
import { useLanguage, content } from "../../../../context/LanguageContext";

export default function NeuroAssetsLayout({ children }) {
  const { language } = useLanguage();
  const tMenu = content[language]?.menu;
  const tAssetMenu = content[language]?.AssetMenu;

  const menuItems = [
    {
      title: tAssetMenu?.title || "Assets",
      icon: <FaRegFileAlt />,
      href: "/neuro-assets",
      subItems: [
        { label: tAssetMenu?.orders || "Orders", href: "/neuro-assets/orders" },
        { label: tAssetMenu?.clients || "Clients", href: "/neuro-assets/clients" },
      ],
    },
    {
      title: tMenu?.accessSettings || "Access settings",
      icon: <FaCog size={20} />,
      href: "/neuro-access/settings",
    },
  ];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col bg-white shadow-md border-r border-[var(--brand-border)]">
        <Menu menuItems={menuItems} />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[var(--brand-background)] overflow-y-auto flex flex-col">
        <Navbar />
        <div className="flex-1 pb-6">{children}</div>

        {/* <Footer /> */}
      </div>
    </div>
  );
}
