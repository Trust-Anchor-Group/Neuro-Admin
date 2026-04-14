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

function appendQuery(url, searchParams) {
  const query = new URLSearchParams();
  const keys = ["limit", "offset", "continuation_token", "paid", "buyer_legal_id", "created_contract_id", "extra"];

  keys.forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const qs = query.toString();
  return qs ? `${url}?${qs}` : url;
}

async function parseUpstreamResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? await response.json()
    : await response.text();
}

export async function GET(request, context) {
  try {
    const projectId = getIdFromParams(await context.params);
    if (!projectId) {
      return new Response(JSON.stringify(new ResponseModel(400, "projectId is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { host } = config.api.agent;
    const baseUrl = `https://${host}`;
    const requestUrl = new URL(request.url);
    const upstreamBase = buildUrl(baseUrl, adminPath(`/project/${projectId}/sales`));
    const url = appendQuery(upstreamBase, requestUrl.searchParams);

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
