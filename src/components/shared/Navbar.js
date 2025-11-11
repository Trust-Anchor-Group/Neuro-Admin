'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { FiUser, FiLogOut } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { LinkToPage } from './LinkToPage'
import { Filter } from './Filter'
import { fetchUserImage } from '@/utils/fetchUserImage'
import { useLanguage } from '../../../context/LanguageContext'
import { applyBrandTheme, getInitialMode, toggleMode } from '../../utils/brandTheme';
import { Sun, Moon, CircleUserRound, } from 'lucide-react'


const Navbar = ({ neuroLogo }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [mode, setMode] = useState('light')
  const router = useRouter()
  const isFetchingRef = useRef(false)
  const hideTimeoutRef = useRef(null)
  const { language, setLanguage, content } = useLanguage()
  const t = content?.[language] || {}

  // Language selection data (recomputed when language changes so current is first)
  const renderFlagLabel = useMemo(
    () => (countryCode, text) => (
      <span className="flex items-center gap-2">
        <span className={`fi fi-${countryCode}`} aria-hidden="true" />
        <span>{text}</span>
      </span>
    ),
    [],
  )

  const usLabelText = 'English (US)'
  const ptLabelText = `Portugu${String.fromCharCode(234)}s (BR)`
  const frLabelText = `Fran${String.fromCharCode(231)}ais`

  const baseLangOptions = useMemo(
    () => [
      { value: 'en', label: renderFlagLabel('us', usLabelText) },
      { value: 'pt', label: renderFlagLabel('br', ptLabelText) },
      { value: 'fr', label: renderFlagLabel('fr', frLabelText) },
    ],
    [renderFlagLabel, ptLabelText, frLabelText],
  )

  const currentLanguage = useMemo(() => baseLangOptions.find(o => o.value === language), [language, baseLangOptions])
  const languageOptions = useMemo(() => ([
    ...baseLangOptions.filter(o => o.value !== language)
  ]), [language, baseLangOptions])

  const handleLanguageChange = (val) => {
    setLanguage(val)
  }

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
    const initialMode = getInitialMode()
    setMode(initialMode)
  }, [])

  useEffect(() => {
    // Apply theme when mode changes
    const host = sessionStorage.getItem('AgentAPI.Host') || ''
    applyBrandTheme(host, mode)
  }, [mode])

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
    <div className="relative z-20 flex items-center justify-between shadow-md border-b bg-[var(--brand-navbar)] border-[var(--brand-border)]">
      {/* Left Section: Welcome Message */}
      <div className="flex items-center gap-4 ml-6 py-4">
      {neuroLogo && (
        <Image
          src={mode === 'dark' ? '/NeuroLogoLight.svg' : '/NeuroLogo.svg'}
          alt="Neuro"
          width={80}
          height={80}
          unoptimized
        />
      )}
    </div>
    <div className="flex items-center gap-4 mr-6 py-4">
      <button
        onClick={() => setMode(prev => toggleMode(prev))}
        className="p-2 rounded-full border border-[var(--brand-border)] transition"
      >
        {mode === 'dark' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
      </button>
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
        className="relative flex items-center bg-[var(--brand-background)] rounded-xl cursor-pointer py-4 px-6 hover:bg-[var(--brand-hover)] gap-6"
      >
        {/* Hover bridge to prevent accidental close */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 w-full h-6 z-20" />
        )}

        {/* User Dropdown */}
        <div className="relative pr-5">
          <div className="flex items-center gap-2 cursor-pointer">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full shadow-sm"
              />
            ) : (
              <CircleUserRound className="w-8 h-8 text-[var(--brand-text-color)]" aria-label="User" />
            )}
            <span className="text-[var(--brand-text-color)] font-medium hidden md:block">
              {(() => {
                const raw = user?.name;
                if (!raw || typeof raw !== 'string') return (t?.navbar?.profile || 'Profile');
                const first = raw.trim().split(/\s+/)[0];
                return first || (t?.navbar?.profile || 'Profile');
              })()}
            </span>
          </div>

          {dropdownOpen && (
            <div className="absolute top-[170%] right-[-20%] w-[140%]  rounded-md bg-[var(--brand-third)] border border-[var(--brand-border)] shadow-lg animate-fade-in z-50">
              <ul>
                <LinkToPage
                  hrefName={`/neuro-access/profile/${user?.legalId}`}
                  setToggle={setDropdownOpen}
                  title={t?.navbar?.profile || 'Profile'}
                  linkClassName="text-[var(--brand-text-color)]"
                  icon={<FiUser size={18} className="text-[var(--brand-text-color)]" />}
                />

                <LinkToPage
                  handleLogout={handleLogout}
                  setToggle={setDropdownOpen}
                  title={t?.navbar?.logout || 'Logout'}
                  icon={<FiLogOut size={18} className="text-red-500" />}
                />
                <li className="px-1 pb-2">
                  <Filter
                    noUrlParam
                    selectArray={languageOptions}
                    displayLabel={currentLanguage?.label}
                    isFilterAccount={true}
                    absoluteClassName={'absolute top-9 left-0 z-50 flex bg-[var(--brand-third)] border border-[var(--brand-border)] flex-col w-full cursor-pointer rounded-md shadow'}
                    size={'w-full'}
                    onSelect={handleLanguageChange}
                  />
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default Navbar

