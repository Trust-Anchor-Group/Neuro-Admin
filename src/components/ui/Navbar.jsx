"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  
  const isActive = (path) => pathname === path;

  return (
    <div className="flex justify-center mt-6">
      <nav className="bg-gray-100 p-2.5 rounded-lg shadow-md flex w-[1000px] justify-between">
        <Link href="/admin/id/current" className="flex-1 text-center">

          <span
            className={`cursor-pointer px-4 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive("/admin/id/current")
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Current IDs
          </span>
        </Link>

        <Link href="/admin/id/pending">
          <span
            className={`cursor-pointer px-4 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive("/admin/id/pending")
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending Applications
          </span>
        </Link>

        <Link href="/admin/id/identity" className="flex-1 text-center">

          <span
            className={`cursor-pointer px-4 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive("/admin/id/identity")
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Identity Roles
          </span>
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;
