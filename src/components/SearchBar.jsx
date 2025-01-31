// To use this SearchBar component, you need to pass the following:
// 1. `searchParams`: You need to have access to search parameters (e.g., in a server-side component) using the `useSearchParams` hook from `next/navigation`.
// 2. Ensure that you use the component inside a routing context where the `useRouter` and `useSearchParams` hooks are available, like a page or a component rendered within the app's routing system.
// 3. Optionally, you can pass a `placeholder` prop to customize the search bar's placeholder text.
//
// If you're unsure how I structured it, check out the following files:
// - `AccessPage` (component/page where this search bar is used)
// - `utils/getUserList` (helper function for fetching user data)
// - `api/mockdata/route.js` (API route that handles mock data fetching)

'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { FaSearch } from 'react-icons/fa'

const SearchBar = ({placeholder}) => {

const searchParams = useSearchParams() // Get search parameters from the URL
const pathName = usePathname() // Get the current path
const { replace } = useRouter() // To navigate when the query changes

function handleSearch(searchTerm){
       // Create a URLSearchParams object to modify the query parameters
    const params = new URLSearchParams(searchParams)
  
    // If we have a search term, set it in the URL query, otherwise delete it
    if(searchTerm){
        params.set('query',searchTerm)
    }else{
        params.delete('query')
    }

    // Replace the current URL with the updated query string
    replace(`${pathName}?${params.toString()}`)
}

  return (
    <div className='relative flex flex-col justify-center items-center'>
        <label className='text-lg' htmlFor="search">Search</label>
        <input type="text" 
        className='w-full border-2 rounded-md py-3 pl-10 text-sm'
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()} />
        <FaSearch className='absolute left-5 top-1/2 h-[30px] w-[20px] -translate-x-1/2'/>
    </div>
  )
}

export default SearchBar