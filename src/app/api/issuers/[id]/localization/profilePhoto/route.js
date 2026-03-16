import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";
import { IMAGE_PROFILES, mapOptimizationError, optimizeImageFormData } from "@/lib/server/imageOptimization";

export const runtime = "nodejs";

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
  try {
    const issuerId = getIdFromParams(await context.params);
    if (!issuerId) {
      return new Response(JSON.stringify(new ResponseModel(400, "issuer_id is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { host } = config.api.agent;
    const baseUrl = `https://${host}`;
    const url = buildUrl(baseUrl, adminPath(`/issuer/${issuerId}/localization/profilePhoto`));

    const incomingFormData = await request.formData();
    let formData;
    try {
      formData = await optimizeImageFormData(incomingFormData, IMAGE_PROFILES.issuerLogo);
    } catch (optimizationError) {
      const mapped = mapOptimizationError(optimizationError);
      return new Response(JSON.stringify(new ResponseModel(mapped.statusCode, mapped.message)), {
        status: mapped.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    const headers = {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      cache: "no-store",
      mode: "cors",
      body: formData,
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
