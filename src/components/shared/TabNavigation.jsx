import Link from 'next/link'
import React from 'react'


export const TabNavigation = ({tab,id,gridCols,tabArray}) => {
  return (
        <nav className={`grid ${gridCols} w-full shadow-sm text-center rounded-lg bg-white/90 font-semibold`}>
            {
                tabArray && tabArray.map((item,index)=> (
        <Link key={index} href={`${item.href}/${id}/?tab=${item.tabDesination}`}>
            <div className={`flex items-center justify-center text-text16 rounded-lg gap-2 py-3  ${tab === `${item.tabRef}` ?
                'bg-aprovedPurple/15 text-neuroPurpleDark  duration-300' : 'bg-white/90 text-neuroTextBlack/60'}`}>
                    <item.icon className='max-md:hidden' size={14} /><span>{item.title}</span></div>
        </Link>
                ))
            }
                    
        </nav>
  )
}
