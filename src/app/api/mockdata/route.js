import { NextResponse } from 'next/server'

export async function GET(req) {
    try {
        // Extract search parameters from the request URL
         const { searchParams } = new URL(req.url)
         const page = parseInt(searchParams.get('page') || '1', 10) //§ Get the page number, default to 1
         const limit = parseInt(searchParams.get('limit') || '5', 10) // Get the limit of users per page, default to 5
        
         const query = searchParams.get('query')?.toLowerCase() || '' // Get the search query, default to an empty string

        const clientCookie = req.headers.get('Cookie');
        
  

        const res = await fetch('https://mateo.lab.tagroot.io/LegalIdentities.ws',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Cookie':clientCookie,
                'Accept':'application/json'
            },
            credentials:'include',
            body:JSON.stringify({
                'maxCount':20,
                'offset':0
            })
        })

        
        const data = await res.json()        
        

         let filteredUsers = data
         if (query) {
             filteredUsers = data.filter(user =>
                 user.name.toLowerCase().includes(query) 
             )
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
