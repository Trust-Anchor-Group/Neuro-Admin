'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, CircleUserRound, Menu, X } from 'lucide-react';

const navigation = [
  { id: 'my-neuro', label: 'My Neuro', href: '/landingpage' },
  { id: 'notifications', label: 'Notifications', href: '/landingpage?section=notifications' },
  { id: 'organization', label: 'Organization', href: '/landingpage?section=organization' },
  { id: 'trust-services', label: 'Trust Services', href: '/landingpage?section=trust-services' },
  { id: 'digital-assets', label: 'Digital Assets', href: '/neuro-assets' },
  { id: 'payments', label: 'Payments', href: '/landingpage?section=payments' },
];

const tabsBySection = {
  'my-neuro': [
    { label: 'Overview', href: '/landingpage?section=my-neuro' },
    { label: 'Assets', href: '/neuro-assets?section=my-neuro' },
    { label: 'Digital Identity', href: '/neuro-access?section=my-neuro' },
    { label: 'Contracts', href: '/landingpage?section=my-neuro&tab=contracts' },
    { label: 'Preferences', href: '/landingpage?section=my-neuro&tab=preferences' },
  ],
  notifications: [{ label: 'Overview', href: '/landingpage?section=notifications' }],
  organization: [
    { label: 'Overview', href: '/landingpage?section=organization' },
    { label: 'Accounts', href: '/neuro-access/account?section=organization' },
    { label: 'Onboarding', href: '/neuro-access/id-application?section=organization' },
  ],
  'trust-services': [
    { label: 'Overview', href: '/landingpage?section=trust-services' },
    { label: 'Accounts', href: '/neuro-access/account?section=trust-services' },
    { label: 'Applications', href: '/neuro-access/id-application?section=trust-services' },
    { label: 'API Keys', href: '/neuro-access/settings/api-keys?section=trust-services' },
    { label: 'My KYC', href: '/neuro-access/settings/my-kyc?section=trust-services' },
  ],
  'digital-assets': [
    { label: 'Overview', href: '/neuro-assets?section=digital-assets' },
    { label: 'Projects', href: '/neuro-assets/Tokens?section=digital-assets' },
    { label: 'Issuers', href: '/neuro-assets/Issuers?section=digital-assets' },
    { label: 'Orders', href: '/neuro-assets/Sales?section=digital-assets' },
  ],
  payments: [
    { label: 'Overview', href: '/landingpage?section=payments' },
    { label: 'Utskick', href: '/landingpage?section=payments&tab=utskick' },
    { label: 'Invoice', href: '/landingpage?section=payments&tab=invoices' },
    { label: 'Subscriptions', href: '/landingpage?section=payments&tab=subscriptions' },
    { label: 'Integrations', href: '/landingpage?section=payments&tab=integrations' },
  ],
};

const sectionForPath = (pathname) => {
  if (pathname.startsWith('/neuro-assets')) return 'digital-assets';
  if (pathname.startsWith('/neuro-access')) return 'my-neuro';
  return null;
};

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const querySection = searchParams.get('section');
  const queryTab = searchParams.get('tab') || '';

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  const section = querySection || sectionForPath(pathname) || 'my-neuro';
  const tabs = tabsBySection[section] || tabsBySection['my-neuro'];
  const activeTab = tabs.find((tab) => {
    const [tabPath, tabQuery = ''] = tab.href.split('?');
    const requestedTab = new URLSearchParams(tabQuery).get('tab');
    if (pathname !== tabPath) return false;
    if (requestedTab) return queryTab === requestedTab;
    return !queryTab;
  }) || (
    section === 'trust-services' && pathname.startsWith('/neuro-access/settings/my-kyc')
      ? tabs.find((tab) => tab.label === 'My KYC')
      : tabs[0]
  );

  return (
    <div className="admin-shell min-h-screen bg-[#f3f4f6] text-[#182127]">
      <button
        className="admin-mobile-menu fixed left-4 top-4 z-50 rounded-lg bg-[#182127] p-2 text-white md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>

      <aside className={`admin-sidebar ${isOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 pt-5 pb-6">
          <Link href="/landingpage" aria-label="Neuro home">
            <Image src="/Neuro W.svg" alt="Neuro" width={178} height={48} priority unoptimized />
          </Link>
          <button className="text-slate-300 md:hidden" onClick={() => setIsOpen(false)} aria-label="Close navigation"><X size={21} /></button>
        </div>

        <nav className="flex flex-1 flex-col px-3 pt-5">
          {navigation.slice(0, 2).map((item) => <NavigationItem key={item.id} item={item} active={section === item.id} />)}
          <Link href="/landingpage?section=organization" className="admin-tenant-card mb-3">
            <span className="text-[11px] text-slate-400">se.id.tagroot.io</span>
            <span className="mt-1 flex items-center justify-between text-[14px] font-semibold text-white">Trust Anchor Group <ChevronRight size={18} /></span>
            <span className="mt-1 text-[11px] text-slate-400">Platform owner</span>
          </Link>
          {navigation.slice(2).map((item) => <NavigationItem key={item.id} item={item} active={section === item.id} />)}
        </nav>

        <div className="flex h-16 w-full items-center gap-2 px-4 text-white">
          <CircleUserRound size={48} className="text-slate-500" />
          <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-[13px] font-semibold">Admin</p><p className="truncate text-[11px] text-slate-400">se.id.tagroot.io</p></div>
          <span className="text-slate-400">⋮</span>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-tabs" aria-label="Section navigation">
          {tabs.map((tab) => {
            const isActive = activeTab?.href === tab.href;
            return <Link key={tab.label} href={tab.href} className={`admin-tab ${isActive ? 'admin-tab--active' : ''}`}>{tab.label}</Link>;
          })}
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

function NavigationItem({ item, active }) {
  return (
    <Link href={item.href} className={`admin-nav-item ${item.id === 'organization' ? 'admin-nav-item--organization' : ''} ${active ? 'admin-nav-item--active' : ''}`}>
      <span>{item.label}</span>
    </Link>
  );
}
