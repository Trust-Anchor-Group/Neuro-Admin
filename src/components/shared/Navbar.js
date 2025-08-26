'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { FiUser, FiLogOut } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { LinkToPage } from './LinkToPage'
import { fetchUserImage } from '@/utils/fetchUserImage'

const Navbar = ({ neuroLogo }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const router = useRouter()
  const isFetchingRef = useRef(false)
  const hideTimeoutRef = useRef(null)

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('neuroUser')
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)

        setUser(parsedUser)

        fetchUserImage(parsedUser?.pictureId).then((imageUrl) => {
          if (imageUrl) {
            setAvatarUrl(imageUrl)
          } else {
            const fallback = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
              parsedUser.name || 'defaultUser'
            )}`
            setAvatarUrl(fallback)
          }
        })
      }
    } catch (error) {
      throw new Error('Error in fetching Navbar image', error)
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  const filterRef = useRef(null)

  useEffect(() => {
    const handleClickOutSide = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutSide)

    return () => {
      document.removeEventListener('mousedown', handleClickOutSide)
    }
  }, [])

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      await fetch('/api/auth/logout', { method: 'GET' })

      sessionStorage.removeItem('neuroUser')
      setUser(null)

      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  return (
    <div className="relative z-20 flex items-center justify-between bg-white shadow-md border-b border-gray-200">
      {/* Left Section: Welcome Message */}
      <div className="flex items-center gap-4 ml-6 py-4">
      {neuroLogo && (
        <Image
          src="/NeuroLogo.svg"
          alt="Neuro"
          width={80}
          height={80}
          unoptimized
        />
      )}
    </div>
      {/* Icons and User Dropdown */}
      <div
        ref={filterRef}
        onMouseEnter={() => {
          clearTimeout(hideTimeoutRef.current)
          setDropdownOpen(true)
        }}
        onMouseLeave={() => {
          hideTimeoutRef.current = setTimeout(() => {
            setDropdownOpen(false)
          }, 200)
        }}
        className="relative flex items-center cursor-pointer mr-6 py-4 px-6 hover:bg-neuroButtonGray gap-6"
      >
        {/* Hover bridge to prevent accidental close */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 w-full h-6 z-20" />
        )}

        {/* User Dropdown */}
        <div className="relative pr-5">
          <div className="flex items-center gap-2 cursor-pointer">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full shadow-sm"
              />
            )}
            <span className="text-gray-700 font-medium hidden md:block">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </div>

          {dropdownOpen && (
            <div className="absolute top-[170%] right-[-20%] w-[140%] rounded-md bg-white shadow-lg animate-fade-in z-50">
              <ul>
                <LinkToPage
                  hrefName={`/neuro-access/profile/${user?.legalId}`}
                  setToggle={setDropdownOpen}
                  title="Profile"
                  icon={<FiUser size={18} className="text-gray-600" />}
                />

                <LinkToPage
                  handleLogout={handleLogout}
                  setToggle={setDropdownOpen}
                  title="Logout"
                  icon={<FiLogOut size={18} className="text-red-500" />}
                />
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
