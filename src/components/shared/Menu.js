'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Menu = ({ menuItems }) => {
  const [open, setOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [host, setHost] = useState('');
  const filterRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutSide = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setHoveredItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutSide);
    return () => {
      document.removeEventListener('mousedown', handleClickOutSide);
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const storedHost = sessionStorage.getItem("AgentAPI.Host");
    if (storedHost) {
      setHost(storedHost);
    }
  }, []);

  if (!isClient) return null;

  return (
    <aside
      ref={filterRef}
      className={`h-screen shadow-md border-r border-gray-200 transition-all duration-300 flex flex-col justify-between ${open ? 'w-64 bg-[#FCFCFC]' : 'w-16'
        }`}
    >
      <div>
        <div className="flex flex-col items-center px-3 py-4 border-b relative bg-[#F5F6F7]">
          {open && (
            <div className="text-center w-full mb-4">
              <div className="bg-[#FCFCFC] py-2 px-4 rounded-lg text-sm text-[#181f259e]">
                {host}
              </div>
            </div>
          )}

          <div
            className={`relative transition-all ${open ? 'w-16 aspect-[1/1]' : 'w-10 aspect-[1/1] my-1'
              }`}
          >
            <Image
              src="/NeuroLogo.svg"
              alt="Neuro Logo"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {open && (
            <div className="w-full px-2 mb-4">
              <div className="bg-[#FCFCFC] p-2 rounded-lg text-sm text-center">
                <strong className="block">Neuro Admin</strong>
                <span className="text-xs text-gray-400">Access</span>
              </div>
            </div>
          )}

          {open && (
            <button
              onClick={() => setOpen(false)}
              aria-label="Collapse sidebar"
              className="absolute bottom-[-7%] right-0 bg-neuroButtonGray text-purple-600 rounded-l p-2 shadow z-20 hover:bg-purple-600 hover:text-white"
            >
              <FaChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`px-2.5 py-3 relative flex flex-col gap-4 ${open ? 'items-start' : 'items-center'}`}>
          {!open && (
            <button
              onClick={() => setOpen(true)}
              aria-label="Expand sidebar"
              className="bg-neuroButtonGray absolute top-[-10%] right-[25%] text-purple-600 rounded p-2 shadow hover:bg-purple-600 hover:text-white"
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
                <div className='border-t pt-3'>

                <Link
                  href={item.href || '#'}
                  className="flex  text-center gap-3 text-[#181F25] text-base font-medium rounded hover:bg-purple-100 hover:text-purple-700 p-3 w-full"
                  >
                    <span className=''>{item.icon}</span>
                  {open && <span>{item.title}</span>}
                </Link>

                </div>
                {/* Inline submenu (if menu is open) */}
                {item.subItems && open && (
                  <ul className="ml-6 mt-1 space-y-1 text-sm">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.label}>
                        <Link
                          href={subItem.href}
                          className="block px-2 py-1 rounded hover:bg-gray-200 text-gray-600 transition"
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Floating submenu (if menu is collapsed and hovered) */}
                {item && !open && hoveredItem === idx && (
                  <ul
                    className="absolute left-full top-3 ml-2 bg-white shadow-lg rounded-lg text-sm p-2 z-30"
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
                    <li className={`font-semibold text-purple-600  ${item.subItems ? 'border-b pb-1 mb-1' : ''}  `}>
                      <Link href={item.href}>
                      {item.title}
                      </Link>
                    </li>
                    {item.subItems && item.subItems.map((subItem) => (
                      <li key={subItem.label}>
                        <Link
                          href={subItem.href}
                          className="block px-2 py-1 rounded hover:bg-gray-200 text-gray-600 transition whitespace-nowrap"
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    )) }
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <footer className="p-4">
        <Link href="/landingpage" className="flex justify-center">
          <Image
            src="/NeuroLogo.svg"
            alt="Neuro Logo"
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
