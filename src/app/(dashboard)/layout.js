"use client";

import Menu from "@/components/shared/Menu";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="flex flex-col bg-white shadow-md border-r border-gray-200">
        <Menu />
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
