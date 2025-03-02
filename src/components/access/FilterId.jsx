import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export const FilterId = () => {

    const searchParams = useSearchParams()
    const pathName = usePathname()
    const { replace } = useRouter()

    function filterIds(filterName){

        const params = new URLSearchParams(searchParams)

        params.set('filterIds',filterName)

        replace(`${pathName}?${params.toString()}`)
        
        

    }


  return (
    <div className='flex gap-2'>
        <button onClick={() => filterIds('fullId')} className='bg-white border-2 rounded-full py-4 px-6 font-semibold cursor-pointer hover:bg-white/30 transition-all'>
            Full Id
        </button>
        <button onClick={() => filterIds('lightId')} className='bg-white border-2 rounded-full py-4 px-6 font-semibold cursor-pointer hover:bg-white/30 transition-all'>
            Light Id
        </button>
    </div>
  )
}
