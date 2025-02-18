"use client";

import React from "react";
import config from "@/config/config";
import dynamic from "next/dynamic";

const QuickLogin = dynamic(() => import("@/components/quickLogin/QuickLogin"), { ssr: false });
const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-white to-blue-50">
      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Login</h1>
      <p className="text-gray-700 mb-4 text-center">
        Scan the QR code with your app to log in securely.
      </p>

      {/* QR Code */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <QuickLogin
          neuron={config.api.agent.host}
          purpose={"Login to Neuro-admin"}
          active={true}
        />
      </div>

      {/* App Download Section */}
      <p className="text-gray-500 mt-4 text-center">
        Don’t have the app?{" "}
        <a
          href="/download-app" // Replace with the actual app download link
          className="text-blue-500 font-semibold hover:underline"
        >
          Download the app here
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
