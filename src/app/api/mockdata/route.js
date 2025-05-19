import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/config/config';

export async function GET(req) {
    try {
        // Extract search parameters from the request URL
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10) //§ Get the page number, default to 1
        const limit = parseInt(searchParams.get('limit') || '5', 10) // Get the limit of users per page, default to 5
        const filterAccount = searchParams.get('filter')
        const query = searchParams.get('query')?.toLowerCase() || '' // Get the search query, default to an empty string

        let fullId 
        if(filterAccount === 'hasID'){
            fullId = true
        } else if( filterAccount === 'noID'){
            fullId = false
        } else {
            fullId = undefined
        }
        const cookieStore = await cookies();
        const clientCookieObject = cookieStore.get('HttpSessionID');
        const clientCookie = clientCookieObject
            ? `HttpSessionID=${encodeURIComponent(clientCookieObject.value)}`
            : null;

            const payload = {
                maxCount:limit,
                offset:(page - 1) * limit,
                ...(query ? {
                    strictSearch:false,
                    fullTextSearch:query,
                } : {} ),
            }


        const { host } = config.api.agent;

        const url = `https://${host}/Accounts.ws`;

            const responseTotalPages = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': clientCookie,
                    'Accept': 'application/json'
                },
                body: JSON.stringify()
            });   

            const dataResponseTotalPages = await responseTotalPages.json()
            console.log('Total Pages',dataResponseTotalPages)



        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });


        if (!res.ok) {
            // Log the response body for more detailed error information
            const errorText = await res.text();
            console.error('Error response text:', errorText);

            // You can decide how to handle the error based on the content.
            return NextResponse.json({ message: `Error: ${res.status}, ${errorText}` }, { status: 500 });
        }

        const data = await res.json()


        const filteredData = data.map((item) => {
           return {
                country:item.country,
                created:item.created,
                email:item.eMail,
                firstName:item.firstName,
                lastNames:item.lastName,
                latestLegalId:item.latestLegalId,
                latestLegalIdState:item.latestLegalIdState,
                phoneNr:item.phoneNr,
                userName:item.userName
            }
        })

         const response = {
             data: filteredData,
             totalPages:dataResponseTotalPages
         }


        return NextResponse.json(response, { status: 200 })

    } catch (error) {

        return NextResponse.json({ message: `Internal Server Error ${error}` }, { status: 500 })
    }
}