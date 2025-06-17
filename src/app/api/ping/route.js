import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {
    const clientCookie = request.headers.get('Cookie');
    const { host } = config.api.agent;
    const url = `https://${host}/Ping`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
        });

        console.log(response);

        let data;
        const contentType = response.headers.get('content-type') || "";

        if (contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (jsonError) {
                data = "Invalid JSON response";
            }
        } else if (contentType.includes('text')) {
            data = await response.text();
        } else {
            data = "Unknown response format";
        }
        console.log(data)

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Ping', data)), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Fetch error:", error);
        return new Response(JSON.stringify(new ResponseModel(500, "Internal Server Error")), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
