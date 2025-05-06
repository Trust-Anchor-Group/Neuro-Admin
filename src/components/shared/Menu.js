'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaHome,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'

const Menu = ({ menuItems }) => {
  const [open, setOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null // ⛔ Undvik SSR-mismatch helt

  return (
    <div
      className={`h-screen bg-white shadow-md border-r border-gray-200 transition-all duration-300 flex flex-col justify-between ${
        open ? 'w-64' : 'w-16'
      }`}
    >
      <div>
        <div className="flex flex-col items-center px-3 py-4 border-b relative">
          <Image
            src="/NeuroLogo.svg"
            alt="Logo"
            width={48}
            height={48}
            unoptimized
          />
          {open && (
            <div className="mt-4 w-full px-2">
              <div className="bg-gray-50 p-2 rounded-lg text-sm text-center">
                <span className="font-semibold">Neuro Admin</span>
                <div className="text-xs text-gray-400">Access</div>
              </div>
            </div>
          )}
          {open && (
            <button
              onClick={() => setOpen(!open)}
              className="absolute top-[13vh] -right-[1vw] bg-gray-100 text-purple-600 rounded p-1 shadow z-20 hover:bg-purple-600 hover:text-white"
            >
              <FaChevronLeft size={16} />
            </button>
          )}
        </div>

        <nav className="flex flex-col items-center justify-center gap-4 py-3">
          {!open && (
            <button
              className="bg-gray-100 text-purple-600 rounded p-2 shadow z-20 transition-all hover:bg-purple-600 hover:text-white"
              onClick={() => setOpen(true)}
            >
              <FaChevronRight size={16} />
            </button>
          )}

          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className="relative"
              onMouseEnter={() => setHoveredItem(idx)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.href || '#'}
                className="flex items-center gap-3 text-gray-700 rounded hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all px-2 py-1"
              >
                <span className="text-lg text-gray-600">{item.icon}</span>
                {open && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </Link>

              {item.subItems && open && (
                <div className="ml-8 text-sm flex flex-col gap-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="py-1 px-2 rounded hover:bg-gray-200 text-gray-600 transition"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}

              {item.subItems && !open && hoveredItem === idx && (
                <div className="absolute left-full top-0 bg-white shadow-lg rounded-lg text-sm p-2 z-30 ml-0">
                  <div className="font-semibold text-purple-600 pb-1 border-b mb-1">
                    {item.title}
                  </div>
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="block py-1 px-2 rounded hover:bg-gray-200 text-gray-600 transition whitespace-nowrap"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setHoveredItem(-1)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              className="text-gray-700 rounded hover:bg-purple-100 hover:text-purple-700 cursor-pointer transition-all p-2"
              href="/landingpage"
            >
              <FaHome size={20} />
            </Link>
            {hoveredItem === -1 && !open && (
              <div className="absolute left-full top-0 bg-white shadow-lg rounded-lg text-sm p-2 z-30 ml-0">
                <span className="text-purple-700 font-semibold px-4 py-1 transition-all cursor-pointer hover:bg-gray-200 hover:rounded-md">
                  All Services
                </span>
              </div>
            )}
          </div>
        </nav>
      </div>

      <Link href="/neuro-access" className="p-4 flex items-center justify-center">
        <div className="mb-4 px-4 flex justify-center">
          <Image
            src="/NeuroLogo.svg"
            alt="Neuro Logo"
            width={open ? 80 : 32}
            height={open ? 80 : 32}
            unoptimized
          />
        </div>
      </Link>
    </div>
  )
}

export default Menu
