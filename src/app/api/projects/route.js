import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

function buildUrl(base, route) {
  return `${base.replace(/\/$/, "")}${route}`;
}

function adminPath(route) {
  return `/nex-api-admin${route}`;
}

const listProjectsApi = {
  key: "listProjects",
  name: "GET /nex-api-admin/project",
  build: (ctx) => {
    const localization = ctx.localizationTag;
    const query = localization ? `?localization=${encodeURIComponent(localization)}` : "";
    return {
      method: "GET",
      url: buildUrl(ctx.baseUrl, adminPath(`/project${query}`)),
      headers: ctx.headers,
    };
  },
};

const getProjectApi = {
  key: "getProject",
  name: "GET /nex-api-admin/project/{projectId}",
  build: (ctx) => {
    const id = ctx.projectId;
    return {
      method: "GET",
      url: buildUrl(ctx.baseUrl, adminPath(`/project/${id}`)),
      headers: ctx.headers,
    };
  },
};

export async function GET(request) {
  const { host } = config.api.agent;
  const baseUrl = `https://${host}`;
  const clientCookie = request.headers.get("Cookie");

  const { searchParams } = new URL(request.url);
  const localizationTag = searchParams.get("localization") || "";
  const projectId = searchParams.get("projectId") || "";

  const headers = {
    Accept: "application/json",
    ...(clientCookie ? { Cookie: clientCookie } : {}),
  };

  const endpoint = projectId
    ? getProjectApi.build({ baseUrl, headers, projectId })
    : listProjectsApi.build({ baseUrl, headers, localizationTag });

  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: endpoint.headers,
      credentials: "include",
      cache: "no-store",
      mode: "cors",
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

const createProjectApi = {
  key: "createProject",
  name: "POST /nex-api-admin/project",
  build: (ctx) => ({
    method: "POST",
    url: buildUrl(ctx.baseUrl, adminPath("/project")),
    headers: ctx.headers,
    body: ctx.body,
  }),
};

export async function POST(request) {
  const { host } = config.api.agent;
  const baseUrl = `https://${host}`;
  const clientCookie = request.headers.get("Cookie");

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(clientCookie ? { Cookie: clientCookie } : {}),
  };

  const endpoint = createProjectApi.build({ baseUrl, headers, body });

  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: endpoint.headers,
      credentials: "include",
      cache: "no-store",
      mode: "cors",
      body: JSON.stringify(endpoint.body || {}),
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