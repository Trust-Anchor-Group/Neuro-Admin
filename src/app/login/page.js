"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import config from "@/config/config";
import { FaQrcode } from "react-icons/fa";
const QuickLogin = dynamic(() => import("@/components/quickLogin/QuickLogin"), { ssr: false });

export default function LoginPage() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6F7] shadow-[0px_0px_10px_0px_rgba(24,31,37,0.05)] font-grotesk">
         {/* <Image
        src="/backgroundSvg.svg"
        alt="Background pattern"
        fill
        className="absolute inset-0 z-0"
        priority
        unoptimized
      /> */}
      <header className="h-20 px-8 flex items-center border-b border-gray-200 bg-white">
        <Image
          src="/NeuroLogo.svg"
          alt="Neuro logo"
          width={140}
          height={40}
          unoptimized
        />
      </header>

      <main className="flex justify-center items-center px-4 py-2">
        <div className="bg-[#FCFCFC] rounded-[1.5rem] shadow-[0px_4px_10px_0px_rgba(24,31,37,0.05)] w-full max-w-4xl flex flex-col md:flex-row items-center justify-center px-2 py-2 gap-12">
          {/* Left side */}
          <div className="flex flex-col items-center">
            <Image
              src="/Neuro-Access-preview.png"
              alt="Phone preview"
              width={260}
              height={500}
              className="mb-6"
              unoptimized
            />
            <span className="text-sm text-gray-600 mb-2">Get the app today</span>
            <div className="flex gap-2">
              <a
                href="https://play.google.com/store/apps/details?id=com.tag.NeuroAccess"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/Google-play-button.png"
                  alt="Google Play"
                  width={130}
                  height={40}
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
                  alt="App Store"
                  width={120}
                  height={40}
                  unoptimized
                />
              </a>
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-center w-full max-w-md">
            <Image
              src="/NeuroLogo.svg"
              alt="Neuro logo"
              width={140}
              height={40}
              className="mb-6"
              unoptimized
            />

            {showQR ? (
              <>
                <QuickLogin
                  neuron={config.api.agent.host}
                  purpose="Login to Neuro-admin"
                  active={true}
                  onLoginSuccess={() => window.location.href = "/landingpage"}
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
                <div className="w-[280px] h-[280px] bg-[#F5F5F5] rounded-xl relative flex items-center justify-center mb-6">
                  {/* Text Centered in the QR box */}
                  <div className="absolute z-10 flex flex-col items-center text-center px-4">
                    <h3 className="text-lg font-semibold text-gray-900">Welcome!</h3>
                    <p className="text-sm text-gray-500">
                      Log in securely with the Neuro-Access app
                    </p>
                  </div>
                  <Image
                    src="/simple-Qr.png"
                    alt="QR Placeholder"
                    width={250}
                    height={250}
                    className="opacity-20"
                    unoptimized
                  />
                </div>

                <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-4 bg-[#8F40D4] hover:bg-[#722FAD] text-white px-7 py-3 rounded-lg text-sm font-semibold shadow"
            >
              <FaQrcode className="text-lg" />
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
