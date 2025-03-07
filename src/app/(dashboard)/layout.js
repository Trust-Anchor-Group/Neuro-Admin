"use client";

import Menu from "@/components/shared/Menu";
import Navbar from "@/components/shared/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 bg-white shadow-md border-r border-gray-200">
        <Link href="/neuro-access" className="flex items-center justify-center lg:justify-start gap-2">
          <Image src="/neuroAdminLogo.svg" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold text-gray-800">Neuro-Admin</span>
        </Link>
        <Menu />
      </div>

      {/* Main Content */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-gray-100 overflow-scroll flex flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
