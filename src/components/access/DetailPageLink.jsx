'use client'
import Link from 'next/link'
import React from 'react'


export const DetailPageLink = ({ name, userId ,classNameText }) => {
    //Send id and to redirect to another page

    return (
        <td className="p-3 break-words text-left max-sm:text-center">
            <Link href={`/list/access/detailpage/${userId}`}>
            <button 
                className={classNameText}
                >
                {name}
            </button>
                </Link>
        </td>
    )
}
