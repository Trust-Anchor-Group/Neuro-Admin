import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {
    console.log("Request received")
    const requestData = await request.json();
    const { legalId } = requestData;
    let dimension;
    if (requestData.dimension > 120 || !requestData.dimension) {
        dimension = 120
    } else {
        dimension = requestData.dimension;
    }

    const { host } = config.api.agent;
    const url = `https://${host}/QuickLogin/Session/${host}/Attachments/${legalId}?Width=${dimension}&Height=${dimension}`;

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType.includes('image/webp')) {
            data = await response.blob();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'image/webp'
                }
            });
        }

        return new Response(data, {
            status: 200,
            headers: {
                'Content-Type': 'image/webp'
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