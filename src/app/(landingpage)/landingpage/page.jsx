'use client'
import Link from 'next/link';
import React from 'react'
import { useState } from 'react'
import { FiShield } from "react-icons/fi";
import { FiBox } from "react-icons/fi";
import { FiCreditCard } from "react-icons/fi";
import { FiServer } from "react-icons/fi";
import { FiArrowRight } from "react-icons/fi";
import { FiLock } from "react-icons/fi";



const LandingPage = () => {

    const [neuroArray, setneuroArray] = useState([
        {
            title:'Neuro-Access',
            href:'/admin',
            icon:FiShield,
            iconColor:'text-blue-500',
            text:'Identity and access management',
            key:''
        },
        {
            title:'Neuro-Assets',
            href:'',
            icon:FiBox,
            iconColor:'text-green-500',
            text:'Asset management system',
            key:FiLock
        },
        {
            title:'Neuro-Pay',
            href:'',
            icon:FiCreditCard,
            iconColor:'text-purple-500',
            text:'Payment processing platform',
            key:FiLock
        },
        {
            title:'Neuro',
            href:'',
            icon:FiServer,
            iconColor:'text-gray-500',
            text:'Server management console',
            key:FiLock
        }
    ])

  return (
    <div className='mx-10 pb-10'>
        <div className='text-center mt-10 '>
            <h1 className='text-4xl font-semibold mb-10'>Neuro</h1>
            <h2 className='text-4xl font-semibold mb-5'>Admin Dashboard</h2>
            <p className='text-lg opacity-70'>Select a service to manaage from the options below</p>
        </div>
        <div className='max-w-6xl mx-auto mt-10'>
            <div className='grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1'>
                {
                    neuroArray.map((item,index)=>(
                <Link href={item.href} key={index}>
                        <div className='flex flex-col gap-5 border-2 p-10 rounded-lg shadow'>
                            <div className='flex justify-between'>
                                <item.icon size={24} className={item.iconColor}/>
                                {
                                    item.key === '' ? '' :
                                    <item.key size={24} className=''/>
                                }
                            </div>
                             <p className='font-semibold text-xl'>{item.title}</p>
                                <p>{item.text}</p>
                                <div className='flex items-center cursor-pointer'>
                                <p className='font-semibold'>Manage</p>
                                <FiArrowRight/>
                                </div>
                        </div>
                </Link>
                    ))
                }
            </div>
        </div>
    </div>
  )
}

export default LandingPage