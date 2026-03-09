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

export async function POST(request, context) {
  return handleResourceRequest(request, context, "POST");
}

export async function DELETE(request, context) {
  return handleResourceRequest(request, context, "DELETE");
}

async function handleResourceRequest(request, context, method) {
  try {
    const id = getIdFromParams(await context.params);
    if (!id) {
      return new Response(JSON.stringify(new ResponseModel(400, "projectId is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { host } = config.api.agent;
    const baseUrl = `https://${host}`;
    const url = buildUrl(baseUrl, adminPath(`/project/${id}/localization/resource`));

    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    const headers = method === "DELETE"
      ? {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        }
      : {
          Accept: "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        };

    let body;
    if (method === "DELETE") {
      let jsonBody = {};
      try {
        jsonBody = await request.json();
      } catch {
        jsonBody = {};
      }
      body = JSON.stringify(jsonBody || {});
    } else {
      const incomingFormData = await request.formData();
      const forwardFormData = new FormData();
      for (const [key, value] of incomingFormData.entries()) {
        forwardFormData.append(key, value);
      }
      body = forwardFormData;
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      cache: "no-store",
      mode: "cors",
      body,
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
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}