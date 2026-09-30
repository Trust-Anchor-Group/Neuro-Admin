import ResponseModel from "@/models/ResponseModel";
import { IMAGE_PROFILES, mapOptimizationError, optimizeImageFormData } from "@/lib/server/imageOptimization";
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';

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
  return handleImageRequest(request, context, "POST");
}

export async function DELETE(request, context) {
  return handleImageRequest(request, context, "DELETE");
}

async function handleImageRequest(request, context, method) {
  let id = "";
  let stage = "request preparation";
  let forwardedUpload = null;
  try {
    id = getIdFromParams(await context.params);
    if (!id) {
      return new Response(JSON.stringify(new ResponseModel(400, "projectId is required")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const activeContext = await getActiveNeuronContext(request);
    const { host } = activeContext;
    const baseUrl = `https://${host}`;
    const url = buildUrl(baseUrl, adminPath(`/project/${id}/localization/image`));

    const cookieHeader = activeContext.upstreamCookieHeader || "";
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
      stage = "image optimization";
      try {
        body = await optimizeImageFormData(incomingFormData, IMAGE_PROFILES.projectMedia);
      } catch (optimizationError) {
        console.error("[project-image-upload] image optimization failed", {
          projectId: id,
          error: optimizationError,
        });
        const mapped = mapOptimizationError(optimizationError);
        return new Response(JSON.stringify(new ResponseModel(mapped.statusCode, mapped.message)), {
          status: mapped.statusCode,
          headers: { "Content-Type": "application/json" },
        });
      }

      const uploadImage = body.get("upload_image");
      forwardedUpload = {
        localization: body.get("localization"),
        fieldNames: [...body.keys()],
        upload_image_ContentType: body.get("upload_image_ContentType"),
        fileName: uploadImage instanceof File ? uploadImage.name : null,
        fileType: uploadImage instanceof File ? uploadImage.type : null,
        fileSize: uploadImage instanceof File ? uploadImage.size : null,
      };
    }

    stage = "upstream fetch";
    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      cache: "no-store",
      mode: "cors",
      body,
    });

    stage = "upstream response parsing";
    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    let data = rawResponse;
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(rawResponse);
      } catch {
        // Preserve the raw response when the upstream JSON is malformed.
      }
    }

    if (!response.ok) {
      console.error("[project-image-upload] upstream request failed", {
        projectId: id,
        method,
        status: response.status,
        upstreamContentType: contentType,
        forwardedUpload,
        rawUpstreamBody: rawResponse,
      });
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
    console.error("[project-image-upload] local request failed", {
      projectId: id,
      method,
      stage,
      error,
    });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }
}
