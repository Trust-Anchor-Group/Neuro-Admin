"use client";

import { LinkToPage } from "@/components/shared/LinkToPage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { FiShield, FiBox, FiCreditCard, FiServer, FiArrowRight, FiLock } from "react-icons/fi";

const LandingPage = () => {

    const router = useRouter()

    const [neuroArray] = useState([
        {
            title: "Neuro-Access",
            href: "/neuro-access",
            icon: FiShield,
            iconColor: "text-blue-600",
            text: "Identity and access management",
            locked: false,
        },
        {
            title: "Neuro-Assets",
            href: "/neuro-assets",
            icon: FiBox,
            iconColor: "text-green-600",
            text: "Asset management system",
            locked: false,
        },
        {
            title: "Neuro-Pay",
            href: "",
            icon: FiCreditCard,
            iconColor: "text-purple-600",
            text: "Payment processing platform",
            locked: true,
        },
        {
            title: "Neuro",
            href: "",
            icon: FiServer,
            iconColor: "text-gray-600",
            text: "Server management console",
            locked: true,
        },
    ]);
    const handleLogout = () => {
        router.push('/api/auth/logout');
        sessionStorage.removeItem("neuroUser"); 
         
      };

    return (
        <div className=" px-6 bg-white">      
            <div className="w-full flex justify-end mt-4 mb-8">
            <LinkToPage handleLogout={handleLogout} title={'Logout'} icon={<FaSignOutAlt />}/>
            </div>          
            <div className="text-center">
                <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">Neuro</h1>
                <h2 className="text-3xl font-semibold text-gray-700 mt-2">Admin Dashboard</h2>
                <p className="text-lg text-gray-500 mt-4 max-w-lg mx-auto">
                    Select a service to manage from the options below
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-7xl">
                {neuroArray.map((item, index) => (
                    <Link href={item.href} key={index} className={`relative group ${item.locked ? "cursor-not-allowed opacity-50" : ""}`}>
                        <div className="flex flex-col justify-between p-8 h-56 bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl">
                            <div className="flex justify-between items-center">
                                <item.icon size={32} className={`${item.iconColor} group-hover:scale-110 transition-all duration-200`} />
                                {item.locked && <FiLock size={24} className="text-gray-400" />}
                            </div>

                            <div className="flex-1">
                                <p className="text-2xl font-semibold text-gray-900">{item.title}</p>
                                <p className="text-gray-500 text-md leading-relaxed">{item.text}</p>
                            </div>

                            <div className="flex items-center justify-between text-blue-600 font-semibold mt-4 cursor-pointer transition-all group-hover:text-blue-700">
                                <span>Manage</span>
                                <FiArrowRight size={18} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default LandingPage;
