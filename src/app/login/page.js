'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { FaQrcode } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

const QuickLogin = dynamic(() => import('@/components/quickLogin/QuickLogin'), {
  ssr: false,
})

const activationCode = 'obinfo:id.tagroot.io:ypNvEVZYM'

export default function LoginPage() {
  const [showQR, setShowQR] = useState(false)
  const [appHelpPanel, setAppHelpPanel] = useState(null)
  const [neuronHost, setNeuronHost] = useState('')
  const router = useRouter()

  const checkLogin = useCallback(async () => {
    const dynamicHost =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('AgentAPI.Host')
        : null

    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        ...(dynamicHost ? { 'x-agent-host': dynamicHost } : {}),
      },
      credentials: 'include',
      body: '{}',
    })

    router.push(response.status === 403 ? '/403' : '/landingpage')
  }, [router])

  useEffect(() => {
    const host = document.querySelector('meta[name="NEURON"]')?.content || ''
    setNeuronHost(host)
  }, [])

  useEffect(() => {
    if (!appHelpPanel) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAppHelpPanel(null)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [appHelpPanel])

  const copyActivationCode = async () => {
    await navigator.clipboard?.writeText(activationCode)
  }

  return (
    <main
      className="login-page flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f6f7] p-4 font-grotesk"
      style={{ backgroundImage: "url('/Login page background.svg')" }}
    >
      <section className="flex h-[710px] w-[450px] max-w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_12px_36px_rgba(24,31,37,0.12)]">
        <header className="h-[132px] shrink-0 bg-[#181F25] px-[30px] pt-[28px]">
          <Image
            src="/Neuro W.svg"
            alt="Neuro"
            width={174}
            height={46}
            priority
            unoptimized
          />
          <p className="mt-[5px] text-[20px] font-semibold leading-none text-[#F5F6F7]">
            Dashboard
          </p>
        </header>

        <div className="flex flex-1 flex-col items-center px-[36px] pt-[48px]">
          <div className="login-qr-frame relative flex h-[300px] w-[300px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#D1D5D8] bg-[#FAFBFB]">
            {showQR ? (
              neuronHost ? (
                <QuickLogin
                  neuron={neuronHost}
                  purpose="Login to Neuro-admin"
                  active
                  onLoginSuccess={checkLogin}
                />
              ) : (
                <p className="text-[13px] text-[#737A7F]">Loading secure login…</p>
              )
            ) : (
              <>
                <div className="absolute z-10 px-4 text-center">
                  <h2 className="text-2xl font-semibold text-[#181F25]">Welcome!</h2>
                  <p className="mt-1 text-sm text-[#737A7F]">
                    Log in securely with the Neuro Access app
                  </p>
                </div>
                <Image
                  src="/simple-Qr.png"
                  alt="QR code placeholder"
                  width={250}
                  height={250}
                  className="opacity-20"
                  priority
                  unoptimized
                />
              </>
            )}
          </div>

          <p className="mt-[24px] text-center text-[12px] font-normal leading-[16px] text-[#737A7F]">
            Scan the QR code with your Access app to log in
          </p>

          {showQR ? (
            <button
              type="button"
              onClick={() => setShowQR(false)}
              className="mt-[20px] h-[48px] w-[294px] rounded-[6px] border border-[#8F40D4] bg-white text-[14px] font-semibold text-[#722FAD] transition-colors hover:bg-[#F8F2FD]"
            >
              Cancel login
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowQR(true)}
              className="mt-[20px] flex h-[48px] w-[294px] items-center justify-center gap-[10px] rounded-[6px] bg-[#8F40D4] text-[14px] font-semibold text-white shadow-[0_2px_4px_rgba(143,64,212,0.18)] transition-colors hover:bg-[#7D35BC]"
            >
              <FaQrcode className="text-[16px]" aria-hidden="true" />
              Start login
            </button>
          )}

          <button
            type="button"
            onClick={() => setAppHelpPanel('choice')}
            className="mt-[14px] flex h-[48px] w-[294px] items-center justify-center rounded-[6px] bg-[#D1E7E4] text-[14px] font-semibold text-[#075D56] transition-colors hover:bg-[#C3DDD9]"
          >
            Don’t have the app?
          </button>
        </div>
      </section>

      {appHelpPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101418]/75 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAppHelpPanel(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Neuro Access app help"
            className="max-h-[calc(100vh-32px)] w-full max-w-[1000px] overflow-auto rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
          >
            <div className="relative w-full bg-[#FCFCFC]">
              <img
                src={`/login-help/app-${appHelpPanel === 'choice' ? 'choice-foreground' : `${appHelpPanel}-foreground`}.svg`}
                alt={appHelpPanel === 'choice' ? 'Choose whether you have downloaded the Neuro Access app' : appHelpPanel === 'yes' ? 'Instructions for using the Neuro Access app' : 'Instructions for downloading and activating the Neuro Access app'}
                className="pointer-events-none relative z-10 block h-auto w-full"
              />

              {appHelpPanel === 'choice' && (
                <div className="pointer-events-none absolute inset-0 z-0">
                  <button type="button" onClick={() => setAppHelpPanel('yes')} aria-label="Yes, I have the Neuro Access app" className="pointer-events-auto absolute left-[3.2%] top-[15.8%] h-[78.4%] w-[45.2%] cursor-pointer rounded-[12px] border-2 border-transparent bg-[#0A715F]/20 hover:bg-[#6B7280]/35 focus:border-[#0A7567] focus:outline-none" />
                  <button type="button" onClick={() => setAppHelpPanel('no')} aria-label="No or unsure, I do not have the Neuro Access app" className="pointer-events-auto absolute right-[3.2%] top-[15.8%] h-[78.4%] w-[45.2%] cursor-pointer rounded-[12px] border-2 border-transparent bg-[#0A715F]/20 hover:bg-[#6B7280]/35 focus:border-[#0A7567] focus:outline-none" />
                </div>
              )}

              {appHelpPanel === 'yes' && (
                <>
                  <img src="/login-help/phone.svg" alt="Neuro Access activation screen" className="pointer-events-none absolute left-[7.32%] top-[19.64%] z-[15] h-[59.56%] w-[37.55%] object-contain" />
                  <img src="/login-help/activation-qr.svg" alt="QR code for activating your digital ID" className="absolute left-[48.6%] top-[25.6%] z-10 h-[32.3%] w-[31.3%] rounded-[14px] object-contain" />
                  <div className="pointer-events-none absolute inset-0 z-0">
                    <button type="button" onClick={() => setAppHelpPanel('choice')} aria-label="Back to app choice" className="app-help-secondary-button pointer-events-auto absolute left-[4%] top-[89.7%] h-[6.2%] w-[45.5%] cursor-pointer rounded-[8px] focus:outline-none" />
                    <button type="button" onClick={() => { setAppHelpPanel(null); setShowQR(true) }} aria-label="Go to login" className="app-help-primary-button pointer-events-auto absolute right-[4%] top-[89.7%] h-[6.2%] w-[45.5%] cursor-pointer rounded-[8px] focus:outline-none" />
                  </div>
                  <button type="button" onClick={copyActivationCode} aria-label="Copy activation code to clipboard" className="app-help-primary-button absolute left-[70.55%] top-[65.9%] z-20 flex h-[4.3%] w-[19.1%] items-center justify-center rounded-[8px] px-1 text-[14px] font-semibold text-white hover:bg-[#07594C] focus:outline-none">Copy to clipboard</button>
                </>
              )}

              {appHelpPanel === 'no' && (
                <>
                  <img src="/login-help/phone.svg" alt="Neuro Access activation screen" className="pointer-events-none absolute left-[7.32%] top-[42.52%] z-[15] h-[42.63%] w-[37.55%] object-contain" />
                  <img src="/login-help/activation-qr.svg" alt="QR code for activating your digital ID" className="absolute left-[48.6%] top-[46.8%] z-10 h-[23.1%] w-[31.3%] rounded-[14px] object-contain" />
                  <div className="pointer-events-none absolute inset-0 z-0">
                    <a href="https://play.google.com/store/apps/details?id=com.tag.NeuroAccess" target="_blank" rel="noopener noreferrer" aria-label="Download Neuro Access from Google Play" className="pointer-events-auto absolute left-[23%] top-[21.5%] h-[5.5%] w-[26%] cursor-pointer rounded-[8px] bg-[#FCFCFC] hover:bg-[#D1D5D8] focus:outline-none" />
                    <a href="https://apps.apple.com/app/neuro-access/id6474308615" target="_blank" rel="noopener noreferrer" aria-label="Download Neuro Access from the App Store" className="pointer-events-auto absolute right-[23%] top-[21.5%] h-[5.5%] w-[26%] cursor-pointer rounded-[8px] bg-[#FCFCFC] hover:bg-[#D1D5D8] focus:outline-none" />
                    <button type="button" onClick={() => setAppHelpPanel('choice')} aria-label="Back to app choice" className="app-help-secondary-button pointer-events-auto absolute left-[4%] top-[92.65%] h-[4.45%] w-[45.5%] cursor-pointer rounded-[8px] focus:outline-none" />
                    <button type="button" onClick={() => { setAppHelpPanel(null); setShowQR(true) }} aria-label="Go to login" className="app-help-primary-button pointer-events-auto absolute right-[4%] top-[92.65%] h-[4.45%] w-[45.5%] cursor-pointer rounded-[8px] focus:outline-none" />
                  </div>
                  <button type="button" onClick={copyActivationCode} aria-label="Copy activation code to clipboard" className="app-help-primary-button absolute left-[70.55%] top-[75.6%] z-20 flex h-[3.1%] w-[19.1%] items-center justify-center rounded-[8px] px-1 text-[14px] font-semibold text-white hover:bg-[#07594C] focus:outline-none">Copy to clipboard</button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
