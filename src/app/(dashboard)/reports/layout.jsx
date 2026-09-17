'use client';

import Menu from '@/components/shared/Menu';
import Navbar from '@/components/shared/Navbar';
import { MdDescription } from 'react-icons/md';

export default function ReportsLayout({ children }) {
  return (
    <div className="h-screen flex bg-gray-50">
      <div className="flex flex-col bg-white shadow-md border-r border-[var(--brand-border)]">
        <Menu menuItems={[{ title: 'Reports', icon: <MdDescription size={20} />, href: '/reports' }]} />
      </div>
      <div className="flex-1 bg-[var(--brand-background)] overflow-y-auto flex flex-col">
        <Navbar />
        <div className="flex-1 pb-6">{children}</div>
      </div>
    </div>
  );
}
