import ResponseModel from "@/models/ResponseModel";
import config from '@/config/config';

export async function GET(req) {

    const clientCookie = req.headers.get('Cookie');
    console.log('THE USER COOKIE!', clientCookie);

    try {
        const {host} = config.api.agent;
        const url = `https://${host}/LegalIdentities.ws`;
/*
        const url = 'https://mateo.lab.tagroot.io/LegalIdentities.ws';
*/
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                'maxCount': 10,
                'offset': 0
            })
        })

        const responseData = await response.json();

        console.log('THE RESPONSE DATA', responseData);

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${responseData}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Successfully fetched legal identities', responseData)),{
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch(error) {

        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
                status: statusCode,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }


}