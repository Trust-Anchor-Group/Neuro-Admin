import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/config/config';
 
export async function GET(req) {
    try {
        console.log('Request',req.url)
        // Extract search parameters from the request URL
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10) //§ Get the page number, default to 1
        const limit = parseInt(searchParams.get('limit') || '5', 10) // Get the limit of users per page, default to 5
        
        const query = searchParams.get('query')?.toLowerCase() || '' // Get the search query, default to an empty string
    
        const filterIds = searchParams.get('filterIds')
        
        const cookieStore = await cookies();
        const clientCookieObject = cookieStore.get('HttpSessionID');
        const clientCookie = clientCookieObject
        ? `HttpSessionID=${encodeURIComponent(clientCookieObject.value)}`
        : null;
    
        
        const { host } = config.api.agent;
        console.log('host',host)
        const url = `https://${host}/LegalIdentities.ws`;
 
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                'maxCount': 20,
                'offset': 0
            })
        });
 
   
 
        const data = await res.json()
 
        let filteredUsers = data
        if (query) {
            filteredUsers = data.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.account.toLowerCase().includes(query)
            ) 

        } 


        
        if(filterIds === 'fullId'){
            filteredUsers = data.filter(user => user.name)
        } else if(filterIds === 'lightId'){
    
            filteredUsers = data.filter(user => !user.name || user.name.trim() === '')
        } else {
            filteredUsers = data
        }


    
        // // Calculate total pages based on the number of filtered users
        const maxPages = Math.ceil(filteredUsers.length / limit)
 
        // // If the requested page exceeds max pages, reset to page 1
        const currentPage = page > maxPages ? 1 : page
 
        // // Calculate the start and end index for pagination
        const startIndex = (currentPage - 1) * limit
        const endIndex = Math.min(startIndex + limit, filteredUsers.length)
 
        // // Extract the users for the current page
        const userList = filteredUsers.slice(startIndex, endIndex)
 
 
        const response = {
            data: userList,
            totalPages: maxPages,
        }
 
 
        return NextResponse.json(response, { status: 200 })
 
    } catch (error) {
 
        return NextResponse.json({ message: `Internal Server Error ${error}` }, { status: 500 })
    }
}