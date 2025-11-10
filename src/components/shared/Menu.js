'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { applyBrandTheme, getInitialMode, toggleMode } from '../../utils/brandTheme';
import { useLanguage, content } from '../../../context/LanguageContext';

const getBrandConfig = (host) => {
  const lowerHost = host?.toLowerCase() || '';
  if (lowerHost.includes('kikkin')) {
    return {
      logo: '/KikkinLogo.jpg',
      name: 'Kikkin Admin',
      subtitle: 'Access',
      themeClass: 'kikkin',
    };
  }

  return {
    logo: '/NeuroLogo.svg',
    name: 'Neuro Admin',
    subtitle: 'Access',
    themeClass: 'mateo',
  };
};


const Menu = ({ menuItems }) => {
  // All hooks must be called unconditionally and in the same order
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mode, setMode] = useState('light');
  const [isClient, setIsClient] = useState(false);
  const [host, setHost] = useState('');
  const filterRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const { language } = useLanguage();
  const t = content?.[language] || {};

  useEffect(() => {
    document.addEventListener('mousedown', (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setHoveredItem(null);
      }
    });
    return () => document.removeEventListener('mousedown', () => { });
  }, []);

  useEffect(() => {
    setIsClient(true);
    const storedHost = sessionStorage.getItem('AgentAPI.Host');
    if (storedHost) setHost(storedHost);
    const initial = getInitialMode();
    setMode(initial);
  }, []);

  useEffect(() => {
    if (isClient) {
      applyBrandTheme(host, mode);
    }
  }, [host, mode, isClient]);

  // Listen for global mode changes dispatched by toggleMode (Navbar) or other tabs
  useEffect(() => {
    if (!isClient) return;
    const handler = (e) => {
      const next = e?.detail || localStorage.getItem('ui.mode');
      if (next === 'light' || next === 'dark') {
        setMode(next);
      }
    };
    window.addEventListener('ui-mode-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('ui-mode-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, [isClient]);


  if (!isClient) return null;

  const { logo, name, subtitle, themeClass } = getBrandConfig(host);
  const dynamicSubtitle = (pathname && pathname.toLowerCase().includes('asset'))
    ? (t?.AssetMenu?.title || 'Assets')
    : (t?.menu?.access || subtitle || 'Access');

  return (
    <aside
      ref={filterRef}
      className={`h-screen shadow-md transition-all duration-300 flex flex-col justify-between ${open ? 'w-64' : 'w-16'} ${themeClass}`}
      style={{
        background: 'var(--brand-sidebar-bg)',
        borderRight: '1px solid border-[var(--brand-border)]'
      }}
    >
      <div>
        {/* HEADER */}
     <div className="flex flex-col items-center px-3 py-4 relative text-brand-on"
       style={{ background: 'var(--brand-primary)', borderBottom: '1px solid var(--brand-border)' }}>
          {open && (
            <div className="text-center w-full mb-4">
              <div className="bg-[var(--brand-third)] py-2 px-4 rounded-lg text-sm font-medium text-brand-on">
                {host}
              </div>
            </div>
          )}

          <div className={`relative transition-all ${open ? 'w-16 aspect-[1/1]' : 'w-10 aspect-[1/1] my-1'}`}>
            <Image
              src={mode === 'dark' ? '/NeuroLogoLight.svg' : '/NeuroLogo.svg'}
              alt="Brand Logo"
              fill
              className="object-contain rounded-full shadow-sm"
              unoptimized
            />
          </div>

          {open && (
            <div className="w-full px-2 mt-4 mb-4">
              <div className="bg-[var(--brand-third)] p-2 rounded-lg text-sm text-center text-brand-on">
                <strong className="block">{name}</strong>
                <span className="text-xs block opacity-80">{dynamicSubtitle}</span>
              </div>
              {/* Theme toggle moved to Navbar */}
            </div>
          )}

          {open && (
            <button
              onClick={() => setOpen(false)}
              aria-label="Collapse sidebar"
              className="absolute bottom-[-7%] right-0 bg-[var(--brand-third)] text-[var(--brand-primary)] rounded-l p-2 shadow z-20 hover:bg-brand-accent hover:text-[var(--brand-third)]"
            >
              <FaChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className={`px-2.5 py-3 relative flex flex-col gap-4 ${open ? 'items-start' : 'items-center'}`}>
          {!open && (
            <button
              onClick={() => setOpen(true)}
              aria-label="Expand sidebar"
              className="bg-[var(--brand-third)] absolute top-[-10%] right-[25%] text-[var(--brand-primary)] rounded p-2 shadow hover:bg-[var(--brand-primary)] hover:text-[var(--brand-third)]"
            >
              <FaChevronRight size={16} />
            </button>
          )}

          <ul className="w-full space-y-2 mt-5">
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                className="relative w-full"
                onMouseEnter={() => {
                  clearTimeout(hideTimeoutRef.current);
                  setHoveredItem(idx);
                }}
                onMouseLeave={() => {
                  hideTimeoutRef.current = setTimeout(() => {
                    setHoveredItem(null);
                  }, 200);
                }}
              >
                <div className="border-t border-[var(--brand-border)] pt-3">
                  <Link
                    href={item.href || '#'}
                    className="menu-item flex gap-3 items-center text-base font-medium p-3 w-full"
                  >
                    <span>{item.icon}</span>
                    {open && <span>{item.title}</span>}
                  </Link>
                </div>

                {/* Subitems (open) */}
                {item.subItems && open && (
                  <ul className="ml-6 mt-1 space-y-1 text-sm">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.label}>
                        <Link
                          href={subItem.href}
                          className="submenu-item"
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Floating submenu (hover + collapsed) */}
                {!open && hoveredItem === idx && (
                  <ul
                    className="submenu-container absolute left-full top-3 ml-2 text-sm p-2 z-30"
                    onMouseEnter={() => clearTimeout(hideTimeoutRef.current)}
                    onMouseLeave={() => {
                      hideTimeoutRef.current = setTimeout(() => {
                        setHoveredItem(null);
                      }, 200);
                    }}
                  >
                    <li className="font-semibold text-brand-accent border-b border-[var(--brand-border)] pb-1 mb-1">
                      <Link href={item.href}>{item.title}</Link>
                    </li>
                    {item.subItems?.map((subItem) => (
                      <li key={subItem.label}>
                        <Link
                          href={subItem.href}
                          className="submenu-item whitespace-nowrap"
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* FOOTER */}
      <footer className="p-4">
        <Link href="/landingpage" className="flex justify-center">
          <Image
            src={mode === 'dark' ? '/NeuroLogoLight.svg' : '/NeuroLogo.svg'}
            alt="Brand Logo"
            width={open ? 80 : 32}
            height={open ? 80 : 32}
            unoptimized
          />
        </Link>
      </footer>
    </aside>
  );
};

export default Menu;
