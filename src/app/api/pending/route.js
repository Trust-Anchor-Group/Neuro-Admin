import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/config/config';
 
export async function GET(req) {
    try {
        // Extract search parameters from the request URL
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10) //§ Get the page number, default to 1
        const limit = parseInt(searchParams.get('limit') || '5', 10) // Get the limit of users per page, default to 5
        
        const query = searchParams.get('query')?.toLowerCase() || '' // Get the search query, default to an empty string
      
        
        const cookieStore = await cookies();
        const clientCookieObject = cookieStore.get('HttpSessionID');
        const clientCookie = clientCookieObject
        ? `HttpSessionID=${encodeURIComponent(clientCookieObject.value)}`
        : null;

        
        const { host } = config.api.agent;
        
        const url = `https://${host}/LegalIdentities.ws`;
 
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                'maxCount': limit,
                'offset': (page - 1) * limit,
                'state':'Created',
                'filter':{
                    "FIRST":query
                }
            })
        });
 
   
 
        const data = await res.json()
        console.log(data)
        console.log(res.statusText)
        console.log(res.status)
 
 
        const response = {
            data:data,
        }
 
 
        return NextResponse.json(response, { status: 200 })
 
    } catch (error) {
 
        return NextResponse.json({ message: `Internal Server Error ${error}` }, { status: 500 })
    }
}