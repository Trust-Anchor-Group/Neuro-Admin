import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export async function GET(req) {
    try {
        // Extract search parameters from the request URL
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10) // Get the page number, default to 1
        const limit = parseInt(searchParams.get('limit') || '5', 10) // Get the limit of users per page, default to 5
        const query = searchParams.get('query')?.toLowerCase() || '' // Get the search query, default to an empty string
        console.log(query)
        // Fetch mock user data from a local JSON file
        const filePath = path.join(process.cwd(), 'src/app/api/userList.json')
        const jsonData = fs.readFileSync(filePath, 'utf-8')
        
        const users = JSON.parse(jsonData) 

        
        let filteredUsers = users
        if (query) {
            filteredUsers = users.filter(user =>
                user.name.toLowerCase().includes(query) 
            )
        }

        // Calculate total pages based on the number of filtered users
        const maxPages = Math.ceil(filteredUsers.length / limit)
        
        // If the requested page exceeds max pages, reset to page 1
        const currentPage = page > maxPages ? 1 : page
        
        // Calculate the start and end index for pagination
        const startIndex = (currentPage - 1) * limit
        const endIndex = Math.min(startIndex + limit, filteredUsers.length)
        
        // Extract the users for the current page
        const userList = filteredUsers.slice(startIndex, endIndex)


        const response = {
            data: userList,
            totalPages: maxPages, 
        }

 
        return NextResponse.json(response, { status: 200 })

    } catch (error) {

        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}
