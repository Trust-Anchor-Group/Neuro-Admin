import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {

    const requestData = await request.json();
    const clientCookie = request.headers.get('Cookie');

    const { host } = config.api.agent;
    const url = `https://${host}/DeleteAccount`;

    const accountName = requestData.accountName;
    // 

    console.log(accountName)
    console.log(url)

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cookie': clientCookie
            },
            credentials: 'include',
            body: accountName,
            mode: 'cors'
        });
        console.log(response)



        const contentType = response.headers.get('content-type');
        let data;

        if (contentType.includes('text/plain; charset=utf-8')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Account succesfully deleted', data)), {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
            status: statusCode,
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            }
        }
        );
    }
}