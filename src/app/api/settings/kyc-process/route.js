import { NextResponse } from "next/server";

const NEURON_URL = "https://dev.athletesandyou.tagroot.io";
const CONTENT_ID = "KYCProcess.xml";

const jsonHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

const getUsername = (account) =>
  account?.userName || account?.username || account?.accountName || account?.name || account?.Account?.userName;

const getReturnedUrl = (data) =>
  data?.url || data?.Url || data?.contentUrl || data?.ContentUrl || data?.data?.url || data?.data?.Url;

export async function POST(request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return NextResponse.json({ error: "Authorization: Bearer <token> is required." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body?.xml !== "string" || !body.xml.includes("<KYCProcess")) {
    return NextResponse.json({ error: "A valid KYC XML document is required." }, { status: 400 });
  }

  try {
    const accountResponse = await fetch(`${NEURON_URL}/Agent/Account/Info`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: "{}",
      cache: "no-store",
    });
    const account = await accountResponse.json().catch(() => ({}));
    if (!accountResponse.ok) {
      return NextResponse.json({ error: "Your Quick Login session could not be validated." }, { status: accountResponse.status });
    }

    const username = getUsername(account);
    if (!username) return NextResponse.json({ error: "The validated account did not include a username." }, { status: 502 });

    const formData = new FormData();
    formData.append("Content", new Blob([body.xml], { type: "application/xml" }), CONTENT_ID);
    formData.append("ContentId", CONTENT_ID);
    formData.append("Visibility", "Public");
    const uploadResponse = await fetch(`${NEURON_URL}/Agent/Storage/Content`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: formData,
      cache: "no-store",
    });
    const upload = await uploadResponse.json().catch(() => ({}));
    if (!uploadResponse.ok) {
      return NextResponse.json({ error: upload?.error || upload?.message || "Neuron rejected the XML upload." }, { status: uploadResponse.status });
    }

    const url = getReturnedUrl(upload) || `${NEURON_URL}/Agent/Storage/Content/${encodeURIComponent(username)}/${CONTENT_ID}`;
    const verification = await fetch(url, { headers: { Accept: "application/xml,text/xml,*/*" }, cache: "no-store" });
    const verified = verification.ok;
    return NextResponse.json({
      confirmed: true,
      verified,
      url,
      contentId: CONTENT_ID,
      visibility: "Public",
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to upload the KYC XML." }, { status: 502 });
  }
}
