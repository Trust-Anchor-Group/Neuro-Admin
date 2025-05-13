import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {
    try {
        const requestData = await request.json();
        const { maxCount, offset, state, createdFrom, filter } = requestData;
        const clientCookie = request.headers.get("Cookie");
      
        const { host } = config.api.agent;
        const url = `https://${host}/LegalIdentities.ws`;

        const payload = {
            maxCount,
            offset: offset || 0,
            'strictSearch':"true",
            filter: (filter?.FIRST ?? '') === '' ? {} : filter,
            state:state
        };

        if (state) payload.state = state; 
        if (createdFrom) payload.createdFrom = createdFrom;

        console.log("Request Payload:", JSON.stringify(payload, null, 2)); 

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": clientCookie,
                "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(payload),
            mode: "cors"
        });

        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(
                JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), 
                {
                    status: response.status,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        return new Response(
            JSON.stringify(new ResponseModel(200, "", data)), 
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );

    } catch (error) {
        console.error("Error fetching legal identities:", error);
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        return new Response(
            JSON.stringify(new ResponseModel(statusCode, message)), 
            {
                status: statusCode,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}
