"use client";

import React, { useState } from "react";
import Image from "next/image";
import config from "@/config/config";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const QuickLogin = dynamic(() => import('@/components/quickLogin/QuickLogin'), { ssr: false });

export default function LoginPage() {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false); // 🚀 Controls QR display

  const handleLoginSuccess = () => {
    router.push('/landingpage');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center border border-gray-200">

        <Image src="/neuroAdminLogo.svg" alt="Neuro Admin" width={80} height={80} className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-gray-500 text-sm mt-2">Log in securely using your Neuro-Access App</p>

        {!showQR ? (
          <div className="mt-6">
            <button
              onClick={() => setShowQR(true)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-all"
            >
              Login with QR Code
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center">
            <QuickLogin
              neuron={config.api.agent.host}
              purpose="Login to Neuro-admin"
              active={true}
              onLoginSuccess={handleLoginSuccess}
            />
            <button
              onClick={() => setShowQR(false)}
              className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold shadow transition"
            >
              Cancel
            </button>
          </div>
        )}

        <p className="text-gray-500 text-sm mt-6">
          Don’t have the app?{' '}
          <a href="https://play.google.com/store/apps/details?id=com.tag.NeuroAccess&pcampaignid=web_share" className="text-blue-500 font-medium hover:underline">
            Download it here
          </a>
        </p>
      </div>
    </div>
  );
}
