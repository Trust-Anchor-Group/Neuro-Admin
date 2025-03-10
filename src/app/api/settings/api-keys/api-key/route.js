import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {
  try {
    const { apiKey } = await request.json();
    const clientCookie = request.headers.get("Cookie");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = `https://${config.api.agent.host}/ApiKey.ws`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": clientCookie,
        "Accept": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ apiKey }),
      mode: "cors",
    });

    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), { status: response.status });
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
