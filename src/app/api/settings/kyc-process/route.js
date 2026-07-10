import ResponseModel from "@/models/ResponseModel";

export const runtime = "nodejs";
const KYC_NEURON_HOST = process.env.KYC_NEURON_HOST || "dev.athletesandyou.tagroot.io";

function findValue(value, names) {
  if (!value || typeof value !== "object") return "";
  for (const [key, nestedValue] of Object.entries(value)) {
    if (names.includes(key.toLowerCase()) && nestedValue !== null && nestedValue !== undefined) {
      return String(nestedValue);
    }
  }
  for (const nestedValue of Object.values(value)) {
    const found = findValue(nestedValue, names);
    if (found) return found;
  }
  return "";
}

function getUploadUrl(data, response) {
  const headerUrl = response.headers.get("location") || "";
  const objectUrl = findValue(data, ["url", "uri", "href"]);
  const text = typeof data === "string" ? data : "";
  const xmlUrl = text.match(/\b(?:url|uri|href)=["']([^"']+)["']/i)?.[1] || "";
  const plainUrl = text.match(/https?:\/\/[^\s<>'"]+/i)?.[0] || "";
  const value = headerUrl || objectUrl || xmlUrl || plainUrl;
  if (!value) return "";
  try {
    return new URL(value, `https://${KYC_NEURON_HOST}`).toString();
  } catch {
    return value;
  }
}

export async function POST(request) {
  try {
    const { xml } = await request.json();
    if (!xml || typeof xml !== "string") {
      return new Response(JSON.stringify(new ResponseModel(400, "A KYC XML document is required.")), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return new Response(JSON.stringify(new ResponseModel(401, "No Agent API bearer token was provided.")), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const accountResponse = await fetch(`https://${KYC_NEURON_HOST}/Agent/Account/Info`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: authorization },
      body: "{}",
    });
    const accountContentType = accountResponse.headers.get("content-type") || "";
    const accountData = accountContentType.includes("application/json") ? await accountResponse.json() : await accountResponse.text();
    if (!accountResponse.ok) {
      const accountDetails = typeof accountData === "string" ? accountData : JSON.stringify(accountData);
      return new Response(JSON.stringify(new ResponseModel(accountResponse.status, `The dev Neuron rejected the Agent API token before upload. A new Quick Login session is required. ${accountDetails}`)), {
        status: accountResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = new FormData();
    formData.append("Content", new Blob([xml], { type: "application/xml" }), "KYCProcess.xml");
    formData.append("ContentId", "KYCProcess.xml");
    formData.append("Visibility", "Public");

    const response = await fetch(`https://${KYC_NEURON_HOST}/Agent/Storage/Content`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: authorization },
      body: formData,
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) {
      const details = typeof data === "string" ? data : JSON.stringify(data);
      const message = response.status === 401
        ? `Your Agent API login is valid, but the dev Neuron rejected access to public content storage. ${details}`
        : `Neuron upload failed: ${details}`;
      return new Response(JSON.stringify(new ResponseModel(response.status, message)), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userName = findValue(accountData, ["username", "accountname"]);
    const fallbackUrl = userName ? `https://${KYC_NEURON_HOST}/Agent/Storage/Content/${encodeURIComponent(userName)}/KYCProcess.xml` : "";
    const url = getUploadUrl(data, response) || fallbackUrl;
    let verified = false;
    if (url) {
      try {
        const verificationResponse = await fetch(url, { method: "GET", headers: { Accept: "application/xml,text/xml,*/*" } });
        verified = verificationResponse.ok;
      } catch {
        verified = false;
      }
    }

    const uploadResult = {
      confirmed: true,
      verified,
      url,
      contentId: "KYCProcess.xml",
      visibility: findValue(data, ["visibility"]) || "Public",
      uploadedAt: findValue(data, ["uploaded", "uploadedat", "timestamp"]) || new Date().toISOString(),
      etag: findValue(data, ["etag"]),
    };

    return new Response(JSON.stringify(new ResponseModel(200, "KYC XML uploaded publicly to the Neuron.", uploadResult)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify(new ResponseModel(500, error.message || "Unable to upload the KYC XML.")), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
