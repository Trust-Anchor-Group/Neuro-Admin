'use client'
import React from 'react'
import { useTransition } from 'react'
import { navigateToDetail } from './NavigateToDetail'


export const DetailPageLink = ({ name, userId,hrefText }) => {
    const [isPending, startTransition] = useTransition()

    return (
        <td className="p-3 break-words text-left">
            <button 
                onClick={() => startTransition(() => navigateToDetail(userId,hrefText))}
                className="text-blue-600 hover:underline hover:text-blue-400"
                disabled={isPending}
            >
                {name}
            </button>
        </td>
    )
}
