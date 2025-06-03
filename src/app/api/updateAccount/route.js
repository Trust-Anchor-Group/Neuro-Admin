import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {

    const requestData = await request.json();
    const { UserName, Password, EMail, PhoneNr, Enabled} = requestData;
    const clientCookie = request.headers.get('Cookie');
    const { host } = config.api.agent;
    const url = `https://${host}/UpdateAccount`;

    const payload = `UserName=${encodeURIComponent(UserName)}&Password=${encodeURIComponent(Password)}&EMail=${encodeURIComponent(EMail)}&PhoneNr=${encodeURIComponent(PhoneNr)}&Enabled=${encodeURIComponent(Enabled)}&FtpRootFolder=&FtpMaxStorage=`;

    
    console.log(payload)

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cookie': clientCookie
            },
            credentials: 'include',
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
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

        return new Response(JSON.stringify(new ResponseModel(200, 'status of LegalID succerfully changed', data)), {
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