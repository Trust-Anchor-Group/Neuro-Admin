'use client'
import React from 'react'
import { useTransition } from 'react'
import { navigateToDetail } from './NavigateToDetail'


export const DetailPageLink = ({ name, userId,hrefText,classNameText }) => {
    //Send id and a href to redirect to another page
    const [isPending, startTransition] = useTransition()

    return (
        <td className="p-3 break-words text-left max-sm:text-center">
            <button 
                onClick={() => startTransition(() => navigateToDetail(userId,hrefText))}
                className={classNameText}
                disabled={isPending}
            >
                {name}
            </button>
        </td>
    )
}
