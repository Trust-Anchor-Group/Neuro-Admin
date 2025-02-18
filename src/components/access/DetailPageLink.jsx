'use client'
import Link from 'next/link'
import React from 'react'


export const DetailPageLink = ({ name, userId ,classNameText }) => {
    //Send id and to redirect to another page

    const nameParts = name.split(' ')

    return (
        <td className="p-3 break-words text-left max-sm:text-center">
            <Link href={`/list/access/detailpage/${userId}`}>
            <button 
                className={classNameText}
                >   
                {nameParts[0]}&nbsp;{nameParts.slice(1).join('')}
            </button>
                </Link>
        </td>
    )
}
