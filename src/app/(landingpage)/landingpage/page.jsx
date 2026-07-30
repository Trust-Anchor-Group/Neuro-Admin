'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getInitialMode, applyBrandTheme } from '@/utils/brandTheme';
import Link from 'next/link';
import {
  MdEmojiTransportation,
  MdAccountBalance,
  MdOutlineTimeline,
  MdOutlineSecurity,
  MdDocumentScanner,
  MdOutlineStorage,
  MdLockOutline,
  MdDescription
} from 'react-icons/md';
import { useLanguage, content as i18nContent } from '../../../../context/LanguageContext'
import PendingApplications from '@/components/access/dashboard/PendingApplications';
import { InputField } from '@/components/access/InputField';
import { LocalizationSettings } from '@/components/access/LocalizationSettings';

// SERVICES LIST
const LandingServices = (t) => ([
  {
    title: 'Neuro-Access',
    description: t?.landing?.services?.neuroAccess?.description,
    icon: MdOutlineSecurity,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: '/neuro-access',
    status: t?.landing?.status?.active,
    locked: false,
  },
  {
    title: 'Neuro-Assets',
    description: t?.landing?.services?.neuroAssets?.description,
    icon: MdDescription,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: '/neuro-assets',
    status: t?.landing?.status?.active,
    locked: false,
    newTab: false,
  },
  // {
  //   title: 'Neuro-Carbon',
  //   description: t?.landing?.services?.neuroCarbon?.description,
  //   icon: MdDocumentScanner,
  //   iconColor: 'text-[#8B5CF6]',
  //   iconBg: 'bg-[#F3E8FF]',
  //   href: '/neuro-carbon',
  //   status: t?.landing?.status?.learnMore,
  //   locked: true,
  // },
  {
    title: 'Neuro-Payments',
    description: t?.landing?.services?.neuroPayments?.description,
    icon: MdAccountBalance,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: 'https://neuro-admin.com/site/loginqr',
    status: t?.landing?.status?.learnMore,
    locked: false,
    newTab: true,
  },
  {
    title: 'Neuro-Monitor',
    description: t?.landing?.services?.neuroMonitor?.description,
    icon: MdOutlineTimeline,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: 'https://neuro-exchange.com/pri/dashboard/',
    status: t?.landing?.status?.learnMore,
    locked: false,
    newTab: true,
  },

  {
    title: 'Neuro-Leasing',
    description: t?.landing?.services?.neuroLeasing?.description,
    icon: MdEmojiTransportation,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-100',
    href: '#',
    status: t?.landing?.status?.learnMore,
    locked: true,
  },
  {
    title: 'Neuron management',
    description: t?.landing?.services?.neuronManagement?.description,
    icon: MdOutlineStorage,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-100',
    href: '#',
    status: t?.landing?.status?.learnMore,
    locked: true,
  },
]);

// BRAND LOGO SELECTOR
const getBrandConfig = (host) => {
  const lowerHost = host?.toLowerCase() || '';
  if (lowerHost.includes('kikkin')) {
    return {
      logo: '/KikkinLogo.jpg',
      name: 'Kikkin Admin',
    };
  }
  return {
    logo: '/NeuroLogo.svg',
    name: 'Neuro Admin',
  };
};

export default function LandingPage() {
  const searchParams = useSearchParams();
  const [host, setHost] = useState('');
  const [mode, setMode] = useState('light');
  const { language } = useLanguage();
  const t = i18nContent[language];
  const services = LandingServices(t);
  const [brand, setBrand] = useState({ logo: '/NeuroLogo.svg', name: 'Neuro Admin' });
  const section = searchParams.get('section');
  const tab = searchParams.get('tab') || 'overview';

  // Initial load: host + initial mode
  useEffect(() => {
    const storedHost = sessionStorage.getItem('AgentAPI.Host');
    if (storedHost) {
      setHost(storedHost);
      setBrand(getBrandConfig(storedHost));
    }
    const initial = getInitialMode();
    setMode(initial);
  }, []);

  // Apply brand theme when mode changes
  useEffect(() => {
    const h = sessionStorage.getItem('AgentAPI.Host') || '';
    applyBrandTheme(h, mode);
  }, [mode]);

  // Listen for global mode change events (dispatched by toggle in Navbar)
  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail || localStorage.getItem('ui.mode');
      if (next === 'light' || next === 'dark') setMode(next);
    };
    window.addEventListener('ui-mode-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('ui-mode-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  if (section === 'trust-services' || section === 'payments') {
    return <SolutionWorkspace section={section} tab={tab} />;
  }

  if (section === 'my-neuro' && tab === 'settings') {
    return <MyNeuroSettings language={language} />;
  }

  return (
    <>
      <div className="relative min-h-screen w-full bg-[var(--brand-background)] font-sans overflow-x-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 bg-[url('/backgroundSvg.svg')] bg-no-repeat bg-cover bg-center opacity-100 filter contrast-[0.6] brightness-[1]" />

        <div className="relative z-10 max-w-[1240px] mx-auto px-6 pt-14 pb-24">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-[24px] font-bold text-[var(--brand-text)]">
              {t?.landing?.header?.welcomeTo || 'Welcome to'} <span className="font-semibold">{brand.name}</span>
            </h1>
            <p className="text-[14px] text-[var(--brand-text-secondary)] mt-1">
              {t?.landing?.header?.subtitle || 'Please select where you would like to enter'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-[48px] items-start">
            {/* LEFT SECTION */}
            <div className="flex flex-col gap-[24px]">
              {/* EcoTech Card */}
              <div className="rounded-[16px] bg-[var(--brand-navbar)] shadow-[0px_4px_10px_rgba(24,31,37,0.05)] px-[24px] py-[20px] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center bg-[var(--brand-background)]">
                    <img
                      src={mode === 'dark' ? '/NeuroLogoLight.svg' : '/NeuroLogo.svg'}
                      alt="Client Logo"
                      className="w-[48px] h-[48px] object-contain rounded-full shadow-sm"
                    />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-bold text-[var(--brand-text)] leading-tight">
                      {host}
                    </h2>
                    <p className="text-[14px] text-[var(--brand-text-secondary)] mt-[4px]">{t?.landing?.labels?.currentNeuron || 'Current Neuron'}</p>
                  </div>
                </div>
              </div>

              {/* Destination Card */}
              <div className="rounded-[16px] bg-[var(--brand-navbar)] shadow-[inset_0_0_10px_rgba(24, 31, 37, 0.10)] px-[24px] py-[20px]">
                <label className="text-[14px] text-[var(--brand-text-secondary)] font-medium block mb-2">
                  {t?.landing?.labels?.destination || 'Destination'}
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-[8px] cursor-pointer bg-[var(--brand-navbar)] py-[12px] px-[16px] text-[16px] text-[var(--brand-text)] border-2 border-[var(--brand-border)] font-medium focus:outline-none">
                    <option>{(t?.landing?.labels?.main || 'Main')} - {host}</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center text-gray-600 text-sm pointer-events-none">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="relative">
              <div className="absolute top-[-60px] right-0 text-sm bg-[var(--brand-navbar)] border border-[var(--brand-border)] px-3 py-1.5 rounded-full shadow-sm text-[var(--brand-text)] flex items-center gap-1">
                <svg className="w-4 h-4 text-[var(--brand-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
                </svg>
                {t?.landing?.labels?.manageServices || 'Manage services'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[32px]">
                {services.map((item, index) => (
                  <Link
                    key={index}
                    href={item.locked ? '#' : item.href}
                    // Open external (absolute) URLs in new tab
                    target={!item.locked && /^https?:\/\//i.test(item.href) ? '_blank' : undefined}
                    rel={!item.locked && /^https?:\/\//i.test(item.href) ? 'noopener noreferrer' : undefined}
                    className={`group relative rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-[24px] w-full h-[240px] flex flex-col justify-between transition duration-200 ${item.locked ? 'opacity-50 hover:opacity-100 ' : 'hover:shadow-md'
                      }`}
                  >
                    {(item.title === 'Neuro-Monitor') && (
                      <div className="absolute top-0 right-0 overflow-hidden w-[150px] h-[150px]">
                        <div className="absolute -right-[40px] top-[20px] w-[150px] bg-[#8F40D4] text-white text-[12px] font-bold text-center transform rotate-45  shadow-md">
                          BETA
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      {item.locked ? (
                        <div className="flex items-center gap-[6px] px-[12px] py-[8px] rounded-full bg-[#DFE1E3]">
                          <item.icon size={18} className="text-gray-700" />
                          <MdLockOutline size={16} className="text-gray-400" />
                        </div>
                      ) : (
                        <div className={`p-[10px] rounded-full ${item.iconBg}`}>
                          <item.icon size={20} className={item.iconColor} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`text-[16px] font-semibold ${item.locked ? 'text-[var(--brand-text-secondary)]' : 'text-[var(--brand-text)]'
                          }`}
                      >
                        {item.title}
                      </h3>
                      <div className="h-[1px] bg-[var(--brand-border)] my-[6px] w-full" />
                      <p
                        className={`text-[14px] leading-[1.4] ${item.locked ? 'text-[var(--brand-text-secondary)]' : 'text-[var(--brand-text)]'
                          }`}
                      >
                        {item.description}
                      </p>
                    </div>

                    <p
                      className={`text-[12px] mt-4 ${item.locked ? 'text-[var(--brand-text-secondary)]' : 'text-[var(--brand-text)]'
                        }`}
                    >
                      {item.status}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MyNeuroSettings({ language }) {
  const [profile, setProfile] = useState(null);
  const [host, setHost] = useState('se.id.tagroot.io');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const languageName = { en: 'English', sv: 'Svenska', br: 'Português', pt: 'Português', fr: 'Français' }[language] || 'English';

  useEffect(() => {
    try {
      const storedProfile = sessionStorage.getItem('profile');
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      setHost(sessionStorage.getItem('AgentAPI.Host') || 'se.id.tagroot.io');
    } catch (error) {
      console.error('Unable to load account settings', error);
    }
  }, []);

  const accountName = profile?.Account || profile?.account || profile?.UserName || profile?.userName || profile?.Properties?.EMAIL || 'No account connected';

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#e4e7e9] p-4 text-[#182127] sm:p-6 lg:p-8 xl:p-10">
      <section className="w-full rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(24,33,39,0.05)] lg:p-8">
        <h1 className="text-base font-bold">My Account</h1>
        <p className="mt-7 text-sm text-[#70777c]">Account name</p>
        <p className="mt-1 break-words text-xl font-bold">{accountName}</p>
        <div className="my-3 border-t border-[#e1e4e6]" />
        <p className="text-sm text-[#70777c]">Registered at: <span className="font-medium">{host}</span></p>
        <p className="mt-3 text-sm text-[#70777c]">Status: <span className="ml-1 inline-flex rounded-full bg-[#d8ebe8] px-2.5 py-1 text-xs font-semibold text-[#17635e]">Active</span></p>
        <button type="button" onClick={() => setAccountModalOpen(true)} className="mt-7 flex h-10 w-full max-w-[230px] items-center justify-center gap-2 rounded-md bg-[#efe0f8] text-sm font-semibold text-[#803bb1] transition hover:bg-[#e8d2f4]"><MdOutlineSecurity size={16} />Manage Account</button>
      </section>

      <section className="mt-6 w-full rounded-xl bg-white p-6 shadow-[0_1px_2px_rgba(24,33,39,0.05)] lg:w-1/2 lg:p-8">
        <h2 className="text-base font-bold">Preferences</h2>
        <div className="mt-5">
          <InputField labelText="Language" name={languageName} />
          <LocalizationSettings />
          <InputField labelText="Default theme" name="Timed" />
        </div>
      </section>
      {accountModalOpen && <AccountDetailsModal profile={profile} host={host} accountName={accountName} onClose={() => setAccountModalOpen(false)} />}
    </main>
  );
}

function AccountDetailsModal({ profile, host, accountName, onClose }) {
  const properties = profile?.Properties || profile?.properties || {};
  const state = profile?.State || profile?.state || 'Active';
  const created = profile?.Created || profile?.created;
  const formattedCreated = created ? new Date(Number(created) > 0 && Number(created) < 100000000000 ? Number(created) * 1000 : created).toLocaleString('sv-SE') : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172126]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
      <section className="w-full max-w-xl rounded-xl bg-white p-7 text-[#182127] shadow-2xl sm:p-8">
        <h2 id="account-modal-title" className="text-sm font-bold">My Account</h2>
        <p className="mt-6 text-xs text-[#70777c]">Account name</p>
        <p className="mt-1 break-words text-base font-bold">{accountName}</p>
        <div className="my-3 border-t border-[#e1e4e6]" />
        <p className="text-xs text-[#70777c]">Registered at: {host}</p>
        <p className="mt-3 text-xs text-[#70777c]">Status: <span className="ml-1 inline-flex rounded-full bg-[#d8ebe8] px-2.5 py-1 text-xs font-semibold text-[#17635e]">{String(state).includes('Approved') ? 'Active' : state}</span></p>

        <section className="mt-6 rounded-xl bg-[#f5f6f7] p-4"><h3 className="text-sm font-bold text-[#70777c]">Account information</h3><dl className="mt-4"><AccountRow label="Email" value={properties.EMAIL || properties.eMail} /><AccountRow label="Phone number" value={properties.PHONE || properties.phoneNr} /></dl></section>
        <section className="mt-5 rounded-xl bg-[#f5f6f7] p-4"><h3 className="text-sm font-bold text-[#70777c]">Account metadata</h3><dl className="mt-4"><AccountRow label="Account status" value={state} /><AccountRow label="Account created" value={formattedCreated} /></dl></section>
        <footer className="mt-7 flex justify-end"><button type="button" onClick={onClose} className="h-10 min-w-24 rounded-md bg-[#f5f6f7] px-5 text-xs font-semibold text-[#31393e] transition hover:bg-[#e9ecee]">Close</button></footer>
      </section>
    </div>
  );
}

function AccountRow({ label, value }) {
  return <div className="grid grid-cols-2 gap-4 border-t border-[#e1e4e6] py-3 text-xs"><dt className="text-[#70777c]">{label}</dt><dd className="break-words font-medium text-[#31393e]">{value || '-'}</dd></div>;
}

const solutionPages = {
  'trust-services': {
    overview: {
      eyebrow: 'Trust Services',
      title: 'Trust Services overview',
      description: 'Manage the trusted identities, organizations, and onboarding flows for your service.',
    },
  },
  payments: {
    overview: {
      eyebrow: 'Payments',
      title: 'Payments overview',
      description: 'See the latest activity across your payment communications, invoices, and subscriptions.',
    },
    utskick: {
      eyebrow: 'Payments',
      title: 'Utskick',
      description: 'Prepare and track outgoing payment communications from one place.',
    },
    invoices: {
      eyebrow: 'Payments',
      title: 'Invoice',
      description: 'Review invoices and their current payment status.',
    },
    subscriptions: {
      eyebrow: 'Payments',
      title: 'Subscriptions',
      description: 'Manage active subscriptions and billing schedules.',
    },
    integrations: {
      eyebrow: 'Payments',
      title: 'Integrations',
      description: 'Connect the payment tools used by your organization.',
    },
  },
};

function SolutionWorkspace({ section, tab }) {
  const page = solutionPages[section]?.[tab] || solutionPages[section].overview;

  if (section === 'trust-services' && tab === 'overview') {
    return (
      <main className="min-h-[calc(100vh-63px)] bg-[#dfe1e3] p-[10px] text-[#182127]">
        <section className="w-full md:w-[49%]">
          <PendingApplications compact />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-8 py-10 text-[#182127]">
      <p className="mb-2 text-sm font-semibold text-[#8f40d4]">{page.eyebrow}</p>
      <h1 className="text-3xl font-bold">{page.title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-[#7a8085]">{page.description}</p>
    </main>
  );
}
