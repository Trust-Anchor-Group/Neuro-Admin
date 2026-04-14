import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

function buildUrl(base, route) {
  return `${base.replace(/\/$/, "")}${route}`;
}

function adminPath(route) {
  return `/nex-api-admin${route}`;
}

async function parseUpstreamResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? await response.json()
    : await response.text();
}

export async function GET(request) {
  try {
    const { host } = config.api.agent;
    const baseUrl = `https://${host}`;
    const requestUrl = new URL(request.url);
    const upstreamBaseUrl = buildUrl(baseUrl, adminPath("/issuer"));
    const search = requestUrl.searchParams.toString();
    const url = search ? `${upstreamBaseUrl}?${search}` : upstreamBaseUrl;

    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    const headers = {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
      mode: "cors",
    });

    const data = await parseUpstreamResponse(response);

    if (!response.ok) {
      return new Response(
        JSON.stringify(new ResponseModel(response.status, `Error: ${typeof data === "string" ? data : JSON.stringify(data)}`)),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const { host } = config.api.agent;
    const baseUrl = `https://${host}`;
    const url = buildUrl(baseUrl, adminPath("/issuer"));

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      cache: "no-store",
      mode: "cors",
      body: JSON.stringify(body || {}),
    });

    const data = await parseUpstreamResponse(response);

    if (!response.ok) {
      return new Response(
        JSON.stringify(new ResponseModel(response.status, `Error: ${typeof data === "string" ? data : JSON.stringify(data)}`)),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(new ResponseModel(200, "", data)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}