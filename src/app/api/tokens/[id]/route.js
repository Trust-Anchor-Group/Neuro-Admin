import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const decodedId = decodeURIComponent(Array.isArray(id) ? id[0] : id);
    const tokenIdParam = decodedId; // Use full id with domain, as Neuron expects
    if (!tokenIdParam) {
      return new Response(
        JSON.stringify(new ResponseModel(400, "tokenId is required.")),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const clientCookie = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    const { host } = config.api.agent;
    const url = `https://${host}/nex-api/getTokenDetails.ws`;

    const payload = { tokenId: tokenIdParam };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(clientCookie ? { Cookie: clientCookie } : {}),
      },
      body: JSON.stringify(payload),
      credentials: "include",
      mode: "cors",
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return new Response(
        JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    const message = error?.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const requestData = await request.json();
    const tokenId = requestData?.tokenId;
    if (!tokenId) {
      return new Response(
        JSON.stringify(new ResponseModel(400, "tokenId is required.")),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const clientCookie = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    const { host } = config.api.agent;
    const url = `https://${host}/nex-api/getTokenDetails.ws`;
    const payload = { tokenId };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(clientCookie ? { Cookie: clientCookie } : {}),
      },
      body: JSON.stringify(payload),
      credentials: "include",
      mode: "cors",
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return new Response(
        JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    const message = error?.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}
