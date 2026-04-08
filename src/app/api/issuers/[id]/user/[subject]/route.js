import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

function buildUrl(base, route) {
  return `${base.replace(/\/$/, "")}${route}`;
}

function adminPath(route) {
  return `/nex-api-admin${route}`;
}

function readParam(params, key) {
  const raw = params?.[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value ? decodeURIComponent(value) : "";
}

async function parseUpstreamResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? await response.json()
    : await response.text();
}

export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const issuerId = readParam(params, "id");
    const subject = readParam(params, "subject");

    if (!issuerId) {
      return new Response(JSON.stringify(new ResponseModel(400, "issuer_id is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!subject) {
      return new Response(JSON.stringify(new ResponseModel(400, "subject is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { host } = config.api.agent;
    const baseUrl = `https://${host}`;
    const url = buildUrl(baseUrl, adminPath(`/issuer/${issuerId}/user/${encodeURIComponent(subject)}`));

    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    const headers = {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };

    const response = await fetch(url, {
      method: "DELETE",
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
        }
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
