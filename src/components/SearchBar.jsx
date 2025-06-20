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
import React, { useRef } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useDebouncedCallback } from 'use-debounce'

const SearchBar = ({placeholder,classNameText}) => {

const searchParams = useSearchParams() // Get search parameters from the URL
const pathName = usePathname() // Get the current path
const { replace } = useRouter() // To navigate when the query changes
const inputRef = useRef(null)

const handleSearch = useDebouncedCallback((searchTerm) =>{
       // Create a URLSearchParams object to modify the query parameters
    const params = new URLSearchParams(searchParams)
    // If we have a search term, set it in the URL query, otherwise delete it
    if(searchTerm){
        params.set('query',searchTerm)
        params.set('page','1')
        params.set('filter','all')
        params.set('limit','50')
    }else{
        params.delete('query')
        params.set('page','1')
    }

    // Replace the current URL with the updated query string
    replace(`${pathName}?${params.toString()}`)

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0);
},200)

  return (
    <div className="relative w-full z-20">
    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      ref={inputRef}
      className={`pl-10 pr-4 py-2 w-full ${classNameText}`} 
      placeholder={placeholder}
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('query')?.toString()}
    />
  </div>
  )
}

export default SearchBar