async function parseResponse(response, fallbackError) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || fallbackError || `Request failed (${response.status})`);
  }

  return payload;
}

export async function createProject(input) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(input),
  });

  const payload = await parseResponse(response, "Failed to create project");
  return payload?.data?.data || payload?.data || null;
}

export async function getProject(projectId) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const payload = await parseResponse(response, "Failed to fetch project");
  return payload?.data?.data || payload?.data || null;
}

export async function updateProject(projectId, patchBody) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(patchBody),
  });

  const payload = await parseResponse(response, "Failed to update project");
  return payload?.data?.data || payload?.data || null;
}

export async function createLocalization(projectId, input) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/localization`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(input),
  });

  const payload = await parseResponse(response, "Failed to create localization");
  return payload?.data?.data || payload?.data || null;
}

export async function listLocalizations(projectId) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/localization`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const payload = await parseResponse(response, "Failed to list localizations");
  return payload?.data?.data || payload?.data || [];
}

export async function updateLocalization(projectId, input) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/localization`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(input),
  });

  const payload = await parseResponse(response, "Failed to update localization");
  return payload?.data?.data || payload?.data || null;
}

export async function listIssuers() {
  const response = await fetch('/api/issuers', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    cache: 'no-store',
  });

  const payload = await parseResponse(response, 'Failed to list issuers');
  const data = payload?.data?.data || payload?.data || [];
  return Array.isArray(data) ? data : [];
}

export async function createIssuer() {
  const response = await fetch('/api/issuers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({}),
  });

  const payload = await parseResponse(response, 'Failed to create issuer');
  return payload?.data?.data || payload?.data || null;
}

export async function createIssuerLocalization(issuerId, input) {
  const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/localization`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({
      localization: input?.localization || 'en-US',
      name: input?.name || '',
      about: input?.about || '',
      location: input?.location || '',
      industry: input?.industry || '',
    }),
  });

  const payload = await parseResponse(response, 'Failed to create issuer localization');
  return payload?.data?.data || payload?.data || null;
}

export async function updateIssuerLocalization(issuerId, input) {
  const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/localization`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({
      localization: input?.localization || 'en-US',
      name: input?.name || '',
      about: input?.about || '',
      location: input?.location || '',
      industry: input?.industry || '',
    }),
  });

  const payload = await parseResponse(response, 'Failed to update issuer localization');
  return payload?.data?.data || payload?.data || null;
}

export async function listIssuerLocalizations(issuerId) {
  const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/localization`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    cache: 'no-store',
  });

  const payload = await parseResponse(response, 'Failed to list issuer localizations');
  const data = payload?.data?.data || payload?.data || [];
  return Array.isArray(data) ? data : [];
}

export async function uploadIssuerProfilePhoto(issuerId, input) {
  const formData = new FormData();
  if (input?.file) {
    formData.append('upload_image', input.file);
  }
  formData.append('localization', input?.localization || 'en-US');
  formData.append('image_description', input?.description || 'Issuer profile photo');
  const imageName = input?.imageName || input?.file?.name || 'issuer-profile-photo';
  formData.append('image_name', imageName);
  formData.append('name', imageName);

  const response = await fetch(`/api/issuers/${encodeURIComponent(issuerId)}/localization/profilePhoto`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    body: formData,
  });

  const payload = await parseResponse(response, 'Failed to upload issuer profile photo');
  return payload?.data?.data || payload?.data || null;
}