'use client';

import React from "react";
import Image from "next/image";
import config from "@/config/config";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation"; 


const QuickLogin = dynamic(() => import('@/components/quickLogin/QuickLogin'), { ssr: false });

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/admin');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-white to-blue-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Login</h1>
      <p className="text-gray-700 mb-4 text-center">
        Scan the QR code with your app to log in securely.
      </p>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <QuickLogin
          neuron={config.api.agent.host}
          purpose="Login to Neuro-admin"
          active={true}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>

      <p className="text-gray-500 mt-4 text-center">
        Don’t have the app?{' '}
        <a href="/download-app" className="text-blue-500 font-semibold hover:underline">
          Download the app here
        </a>
      </p>
    </div>
  );
}
