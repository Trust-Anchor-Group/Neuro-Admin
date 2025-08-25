'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MdEmojiTransportation,
  MdAccountBalance,
  MdOutlineTimeline,
  MdOutlineSecurity,
  MdDocumentScanner,
  MdOutlineStorage,
  MdLockOutline,
} from 'react-icons/md';
import Navbar from '@/components/shared/Navbar';
import SessionPing from "@/components/SessionPing"

// SERVICES LIST
const services = [
  {
    title: 'Neuro-Access',
    description: 'Identity and access management',
    icon: MdOutlineSecurity,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: '/neuro-access',
    status: 'Active',
    locked: false,
  },
  {
    title: 'Neuro-Carbon',
    description: 'Climate compensation management',
    icon: MdDocumentScanner,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: '/neuro-carbon',
    status: 'Learn more',
    locked: true,
  },
  {
    title: 'Neuro-Monitor',
    description: 'Asset and process monitoring',
    icon: MdOutlineTimeline,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: 'https://neuro-exchange.com/pri/dashboard/',
    status: 'Learn more',
    locked: false,
    newTab: true,
  },
  {
    title: 'Neuro-Payments',
    description: 'Payment monitoring and management',
    icon: MdAccountBalance,
    iconColor: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F3E8FF]',
    href: 'https://neuro-admin.com/site/loginqr',
    status: 'Learn more',
    locked: false,
    newTab: true,
  },
  {
    title: 'Neuro-Leasing',
    description: 'Leasing management portal',
    icon: MdEmojiTransportation,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-100',
    href: '#',
    status: 'Learn more',
    locked: true,
  },
  {
    title: 'Neuron management',
    description: 'Server management console',
    icon: MdOutlineStorage,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-100',
    href: '#',
    status: 'Learn more',
    locked: true,
  },
];

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
  const [host, setHost] = useState('');
  const [brand, setBrand] = useState({ logo: '/NeuroLogo.svg', name: 'Neuro Admin' });

  useEffect(() => {
    const storedHost = sessionStorage.getItem('AgentAPI.Host');
    if (storedHost) {
      setHost(storedHost);
      setBrand(getBrandConfig(storedHost));
    }
  }, []);

  return (
    <>
      <SessionPing />
    <div className="relative min-h-screen w-full bg-[#F5F6F7] font-sans overflow-x-hidden">
      <Navbar neuroLogo={true} />

      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[url('/backgroundSvg.svg')] bg-no-repeat bg-cover bg-center opacity-100 filter contrast-[0.6] brightness-[1]" />

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 pt-14 pb-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-[24px] font-bold text-gray-900">
            Welcome to <span className="font-semibold">{brand.name}</span>
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Please select where you would like to enter
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-[48px] items-start">
          {/* LEFT SECTION */}
          <div className="flex flex-col gap-[24px]">
            {/* EcoTech Card */}
            <div className="rounded-[16px] bg-[var(--brand-secondary)] shadow-[0px_4px_10px_rgba(24,31,37,0.05)] px-[24px] py-[20px] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center bg-[var(--brand-background)]">
                  <img
                    src={brand.logo}
                    alt="Client Logo"
                    className="w-[48px] h-[48px] object-contain rounded-full shadow-sm"
                  />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
                    {host}
                  </h2>
                  <p className="text-[14px] text-gray-500 mt-[4px]">Current Neuron</p>
                </div>
              </div>
            </div>

            {/* Destination Card */}
            <div className="rounded-[16px] bg-[#DFE1E3] shadow-[inset_0_0_10px_rgba(24, 31, 37, 0.10)] px-[24px] py-[20px]">
              <label className="text-[14px] text-gray-700 font-medium block mb-2">
                Destination
              </label>
              <div className="relative">
                <select className="w-full appearance-none rounded-[8px] cursor-pointer bg-white py-[12px] px-[16px] text-[16px] text-gray-900 font-medium focus:outline-none">
                  <option>Main - {host}</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center text-gray-600 text-sm pointer-events-none">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="relative">
            <div className="absolute top-[-60px] right-0 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm text-gray-700 flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
              </svg>
              Manage services
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[32px]">
              {services.map((item, index) => (
                <Link
                  key={index}
                  href={item.locked ? '#' : item.href}
                  // Open external (absolute) URLs in new tab
                  target={!item.locked && /^https?:\/\//i.test(item.href) ? '_blank' : undefined}
                  rel={!item.locked && /^https?:\/\//i.test(item.href) ? 'noopener noreferrer' : undefined}
                  className={`group rounded-[16px] border border-gray-200 bg-white p-[24px] w-full h-[240px] flex flex-col justify-between transition duration-200 ${item.locked ? 'opacity-50 hover:opacity-100 ' : 'hover:shadow-md'
                    }`}
                >
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
                      className={`text-[16px] font-semibold ${item.locked ? 'text-gray-400' : 'text-gray-900'
                        }`}
                    >
                      {item.title}
                    </h3>
                    <div className="h-[1px] bg-gray-200 my-[6px] w-full" />
                    <p
                      className={`text-[14px] leading-[1.4] ${item.locked ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  <p
                    className={`text-[12px] mt-4 ${item.locked ? 'text-gray-400' : 'text-gray-500'
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
