import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {

    const requestData = await request.json();
    const { to, subject, message, name, link } = requestData;
    const clientCookie = request.headers.get('Cookie');

    const { host } = config.api.agent;
    const url = `https://${host}/SendMail.ws`;

    const body = 
    `
    <div style="font-family: system-ui, sans-serif, Arial; font-size: 12px;">
        <p><span style="font-family: verdana, geneva, sans-serif;"><strong>Hello ${name}</strong></span></p>
        <p><span style="font-family: verdana, geneva, sans-serif;">${message}</span></p>
        <p><a href=${link}>kikkin KYC/KYB Onboarding</a></p>
        <p><br> &nbsp;</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p><span style="color: #7e8c8d;"><span style="font-family: verdana, geneva, sans-serif;">Best,</span></span></p>
        <p><em><span style="font-family: verdana, geneva, sans-serif;">Neuro ID services</span></em></p>
        <p>&nbsp;</p>
        <p><span style="font-family: verdana, geneva, sans-serif; color: #7e8c8d;">OBS: This is an automated message. Please do not reply to this e-mail.</span></p>
    </div>
`
    const payload = {
        to,
        subject,
        body
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

        return new Response(JSON.stringify(new ResponseModel(200, '', data)), {
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