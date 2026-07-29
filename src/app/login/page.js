'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { FaQrcode } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

const QuickLogin = dynamic(() => import('@/components/quickLogin/QuickLogin'), {
  ssr: false,
})

export default function LoginPage() {
  const [showQR, setShowQR] = useState(false)
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
          <div className="login-qr-frame flex h-[300px] w-[300px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#D1D5D8] bg-[#FAFBFB]">
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
              <Image
                src="/simple-Qr.png"
                alt="QR code placeholder"
                width={250}
                height={250}
                className="opacity-[0.13]"
                priority
                unoptimized
              />
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

          <a
            href="https://play.google.com/store/apps/details?id=com.tag.NeuroAccess"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[14px] flex h-[48px] w-[294px] items-center justify-center rounded-[6px] bg-[#D1E7E4] text-[14px] font-semibold text-[#075D56] transition-colors hover:bg-[#C3DDD9]"
          >
            Don’t have the app?
          </a>
        </div>
      </section>
    </main>
  )
}
