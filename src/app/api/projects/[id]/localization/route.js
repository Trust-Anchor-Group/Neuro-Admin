import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

function buildUrl(base, route) {
  return `${base.replace(/\/$/, "")}${route}`;
}

function adminPath(route) {
  return `/nex-api-admin${route}`;
}

function getIdFromParams(params) {
  const id = params?.id;
  const raw = Array.isArray(id) ? id[0] : id;
  return raw ? decodeURIComponent(raw) : "";
}

function makeHeaders(request, hasBody = false) {
  const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    Accept: "application/json",
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

async function proxyLocalization({ request, method, id, body }) {
  const { host } = config.api.agent;
  const baseUrl = `https://${host}`;
  const headers = makeHeaders(request, method !== "GET");
  const url = buildUrl(baseUrl, adminPath(`/project/${id}/localization`));

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    cache: "no-store",
    mode: "cors",
    ...(method !== "GET" ? { body: JSON.stringify(body || {}) } : {}),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

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
}

export async function GET(request, context) {
  try {
    const id = getIdFromParams(await context.params);
    if (!id) {
      return new Response(JSON.stringify(new ResponseModel(400, "projectId is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return await proxyLocalization({ request, method: "GET", id });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request, context) {
  try {
    const id = getIdFromParams(await context.params);
    if (!id) {
      return new Response(JSON.stringify(new ResponseModel(400, "projectId is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    return await proxyLocalization({ request, method: "POST", id, body });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(request, context) {
  try {
    const id = getIdFromParams(await context.params);
    if (!id) {
      return new Response(JSON.stringify(new ResponseModel(400, "projectId is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    return await proxyLocalization({ request, method: "PATCH", id, body });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}