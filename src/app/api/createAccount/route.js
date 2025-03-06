import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {

    const requestData = await request.json();
    const clientCookie = request.headers.get('Cookie');

    const { host } = config.api.agent;
    const url = `https://${host}/CreateAccount`;

    const queryString = new URLSearchParams({
        UserName: requestData.UserName,
        Password: requestData.Password,
        EMail: requestData.EMail,
        PhoneNr: requestData.PhoneNr
      }).toString();
      
    // state can be set to Created, Approved, Rejected, Obsoleted, or Compromised

    console.log(queryString)
    console.log(url)

    try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': clientCookie
            },
            credentials: 'include',
            body: queryString,
            mode: 'cors'
        });
        console.log(response)



        const contentType = response.headers.get('content-type');
        let data;

        if (contentType.includes('application/x-www-form-urlencoded')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Account succesfully created', data)), {
            status: 200,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
            status: statusCode,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
        );
    }
}