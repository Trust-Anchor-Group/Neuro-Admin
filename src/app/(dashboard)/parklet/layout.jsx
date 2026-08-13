'use client';

import { MdBusiness, MdLocalParking } from 'react-icons/md';
import Menu from '@/components/shared/Menu';
import Navbar from '@/components/shared/Navbar';

export default function ParkletLayout({ children }) {
  const menuItems = [
    {
      title: 'Parklet',
      icon: <MdBusiness size={20} />,
      href: '/parklet',
      subItems: [
        { label: 'Organisationer', href: '/parklet' },
        { label: 'Parkeringar', href: '/parklet/parkeringar', icon: <MdLocalParking size={18} /> },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-col bg-white shadow-md">
        <Menu menuItems={menuItems} />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto bg-[var(--brand-background)]">
        <Navbar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
