function buildQuery(params) {
  const query = new URLSearchParams();

  if (params?.limit !== undefined && params?.limit !== null) {
    query.set("limit", String(params.limit));
  }

  if (params?.continuation_token) {
    query.set("continuation_token", String(params.continuation_token));
  } else if (params?.offset !== undefined && params?.offset !== null) {
    query.set("offset", String(params.offset));
  }

  if (params?.paid !== undefined && params?.paid !== null && params?.paid !== "") {
    query.set("paid", String(params.paid));
  }
  if (params?.buyer_legal_id) {
    query.set("buyer_legal_id", String(params.buyer_legal_id));
  }
  if (params?.created_contract_id) {
    query.set("created_contract_id", String(params.created_contract_id));
  }
  if (params?.extra !== undefined && params?.extra !== null && params?.extra !== "") {
    query.set("extra", String(params.extra));
  }

  return query.toString();
}

function unwrapEnvelope(payload) {
  const candidates = [payload?.data, payload?.data?.data, payload];
  const envelope = candidates.find((item) => item && typeof item === "object") || {};

  const data = Array.isArray(envelope?.data)
    ? envelope.data
    : Array.isArray(payload?.data?.data)
      ? payload.data.data
      : [];

  const rawCount = envelope?.count ?? payload?.data?.count ?? data.length;
  const count = Number.isFinite(Number(rawCount)) ? Number(rawCount) : data.length;
  const continuationToken = envelope?.continuation_token ?? payload?.data?.continuation_token ?? null;
  return {
    data,
    count,
    continuation_token: continuationToken,
    raw: payload,
  };
}

function extractErrorCode(payload) {
  const message = String(payload?.message || payload?.error || "");
  const fromData = String(payload?.data?.error_code || payload?.error_code || "").toLowerCase();
  if (fromData) return fromData;
  if (/wrong_resource/i.test(message)) return "wrong_resource";
  if (/invalid_continuation_token/i.test(message)) return "invalid_continuation_token";
  return "";
}

async function requestSales(url, params) {
  const query = buildQuery(params);
  const target = query ? `${url}?${query}` : url;

  const response = await fetch(target, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.message || `Failed to fetch sales (${response.status})`);
    error.status = response.status;
    error.errorCode = extractErrorCode(payload);
    error.payload = payload;
    throw error;
  }

  return unwrapEnvelope(payload);
}

export function listGlobalSales(params) {
  return requestSales("/api/sales", params);
}

export function listIssuerSales(issuerId, params) {
  return requestSales(`/api/issuers/${encodeURIComponent(issuerId)}/sales`, params);
}

export function listProjectSales(projectId, params) {
  return requestSales(`/api/projects/${encodeURIComponent(projectId)}/sales`, params);
}
