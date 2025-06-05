'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Menu = ({ menuItems }) => {
  const [open, setOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [host, setHost] = useState('');


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
      className={`h-screen shadow-md border-r border-gray-200 transition-all duration-300 flex flex-col justify-between ${open ? 'w-64 bg-[#FCFCFC]' : 'w-16'
        }`}
    >
      <div >
        <div className="flex flex-col items-center px-3 py-4 border-b relative bg-[#F5F6F7]">
          {open && (
            <div className="text-center w-full mb-4">
              <div className="bg-[#FCFCFC] py-2 px-4 rounded-lg text-sm text-[#181f259e]">
                {host}
              </div>
            </div>
          )}

          {/* Shrinkable Logo centered with equal spacing above/below */}
          <div
            className={`relative transition-all  ${open ? 'w-16 aspect-[1/1]' : 'w-10 aspect-[1/1] my-1'
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
            <div className="w-full px-2 ">
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
              className="absolute top-[25vh] -right-[1vw] bg-gray-100 text-purple-600 rounded p-1 shadow z-20 hover:bg-purple-600 hover:text-white"
            >
              <FaChevronLeft size={16} />
            </button>
          )}
        </div>
        {/* Navigation */}
        <nav className={`px-2 py-3 flex flex-col gap-4 ${open ? 'items-start' : 'items-center'}`}>
          {!open && (
            <button
              onClick={() => setOpen(true)}
              aria-label="Expand sidebar"
              className="bg-gray-100 text-purple-600 rounded p-2 shadow hover:bg-purple-600 hover:text-white"
            >
              <FaChevronRight size={16} />
            </button>
          )}

          <ul className="w-full space-y-2">
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                onMouseEnter={() => setHoveredItem(idx)}
                onMouseLeave={() => setHoveredItem(null)}
                className="relative w-full"
              >
                <Link
                  href={item.href || '#'}
                  className="flex items-center gap-3 text-[#181F25] text-base font-medium rounded hover:bg-purple-100 hover:text-purple-700 px-2 py-2 w-full"
                >
                  <span>{item.icon}</span>
                  {open && <span>{item.title}</span>}
                </Link>

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

                {item.subItems && !open && hoveredItem === idx && (
                  <ul className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg text-sm p-2 z-30">
                    <li className="font-semibold text-purple-600 pb-1 border-b mb-1">
                      {item.title}
                    </li>
                    {item.subItems.map((subItem) => (
                      <li key={subItem.label}>
                        <Link
                          href={subItem.href}
                          className="block px-2 py-1 rounded hover:bg-gray-200 text-gray-600 transition whitespace-nowrap"
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

      {/* Footer Logo — optional or removed if redundant */}
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
