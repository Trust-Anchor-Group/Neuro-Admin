"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import config from "@/config/config";
import { FaQrcode } from "react-icons/fa";
import { useRouter } from 'next/navigation';

const QuickLogin = dynamic(
  () => import("@/components/quickLogin/QuickLogin"),
  { ssr: false }
);

export default function LoginPage() {
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();
  return (
    <div
      style={{
        backgroundImage: "url('/Login-page-background.png')",
        backgroundSize: "110% auto",
        backgroundPosition: "center",
      }}
      className="relative min-h-screen font-grotesk overflow-hidden"
    >
      {/* HEADER */}
      <header className="relative z-10 h-20 px-8 flex items-center border-b border-gray-200 bg-white">
        <Image
          src="/NeuroLogo.svg"
          alt="Neuro logo"
          width={150}
          height={42}
          unoptimized
        />
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex justify-center items-center px-4 pt-20 pb-10">
        {/* LOGIN CARD */}
        <div className="bg-[#FCFCFC] rounded-[1.5rem] shadow-[0px_4px_10px_rgba(24,31,37,0.05)] w-full max-w-6xl flex flex-col md:flex-row px-12 py-10 gap-16">
          
          {/* LEFT COLUMN: phone + badges */}
          <div className="order-2 md:order-1 md:w-1/2 flex justify-end">
            <div className="flex flex-col md:flex-row items-center md:items-start bg-gray-100 p-10 rounded-2xl">
              
              {/* Phone mockup (hidden on mobile, visible from md up) */}
              <Image
                src="/Neuro-Access-preview.png"
                alt="Phone preview"
                width={350}
                height={620}
                className="mb-6 md:mb-0"
                unoptimized
              />

              {/* Badge column */}
              <div className="flex flex-col items-center md:items-start md:-ml-16 md:mt-28">
                <span className="text-base text-gray-600 mb-0 md:ml-2">
                  Get the app today
                </span>
                <div className="flex flex-col gap-0">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.tag.NeuroAccess"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/Google-play-button.png"
                      alt="Get it on Google Play"
                      width={190}
                      height={100}
                      unoptimized
                    />
                  </a>
                  <a
                    href="https://apps.apple.com/us/app/neuro-access/id6476126341"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/app-store-button.png"
                      alt="Download on the App Store"
                      width={190}
                      height={100}
                      unoptimized
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="order-1 md:order-2 md:w-1/2 flex flex-col items-center w-full max-w-md pt-10">
            <Image
              src="/NeuroLogo.svg"
              alt="Neuro logo"
              width={250}
              height={42}
              className="hidden md:block mb-10"
              unoptimized
            />

            {showQR ? (
              <>
                <QuickLogin
                  neuron={config.api.agent.host}
                  purpose="Login to Neuro-admin"
                  active
                  onLoginSuccess={() => router.push('/landingpage')}
                />
                <button
                  onClick={() => setShowQR(false)}
                  className="mt-6 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel login
                </button>
              </>
            ) : (
              <>
                <div className="w-[300px] h-[300px] bg-[#F5F5F5] rounded-xl relative flex items-center justify-center mb-6">
                  <div className="absolute z-10 flex flex-col items-center text-center px-4">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      Welcome!
                    </h3>
                    <p className="text-sm text-gray-500">
                      Log in securely with the Neuro-Access app
                    </p>
                  </div>
                  <Image
                    src="/simple-Qr.png"
                    alt="QR Placeholder"
                    width={280}
                    height={280}
                    className="opacity-20"
                    unoptimized
                  />
                </div>

                <button
                  onClick={() => setShowQR(true)}
                  className="flex items-center gap-4 bg-[#8F40D4] hover:bg-[#722FAD] text-white px-20 py-3 rounded-lg text-sm font-semibold shadow"
                >
                  <FaQrcode className="text-xl" />
                  Start Login
                </button>
              </>
            )}

            <p className="text-sm text-gray-500 mt-4 text-center">
              Don’t have the app?{" "}
              <a
                href="https://play.google.com/store/apps/details?id=com.tag.NeuroAccess"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline font-medium"
              >
                Download it here
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
