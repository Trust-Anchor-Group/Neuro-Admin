import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {

    const requestData = await request.json();
    const { userName } = requestData;
    const clientCookie = request.headers.get('Cookie');

    const { host } = config.api.agent;
    const url = `https://${host}/account.ws`;

    const payload = {
        userName
    };


    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload),
            mode: 'cors'
        });


        const contentType = response.headers.get('content-type');
        let data;
        let filteredData

        if (contentType.includes('application/json')) {
            data = await response.json();
            filteredData = {
                country:data.account.country,
                firstName:data.account.firstName,
                lastNames:data.account.lastNames,
                eMail:data.account.eMail,
                userName:data.account.userName,
                created:data.account.created
            }
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Account returned', {data:filteredData})), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
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