import 'server-only';

import {
  callFixedParkletScript,
  fetchParkletAdminJson,
} from '@/lib/server/parkletAdminTransport';
import {
  PARKLET_APPROVE_ORGANIZATION_SCRIPT_PATH,
  PARKLET_APPROVE_PARKING_AREA_SCRIPT_PATH,
  PARKLET_DENY_ORGANIZATION_SCRIPT_PATH,
  PARKLET_REACTIVATE_ORGANIZATION_SCRIPT_PATH,
  PARKLET_REJECT_PARKING_AREA_SCRIPT_PATH,
  normalizeParkletOrganization,
  normalizeParkletOrganizationPage,
  normalizeParkletParkingArea,
  normalizeParkletParkingAreaPage,
} from '@/lib/parkletAdmin.mjs';

export async function listParkletOrganizations(request, status) {
  const result = await fetchParkletAdminJson(request, {
    path: `/parklet-admin-api/organizations?status=${encodeURIComponent(status)}`,
    method: 'GET',
  });

  return {
    ...result,
    safeBody: result.response.ok ? normalizeParkletOrganizationPage(result.body) : safeErrorBody(result.body),
  };
}

export async function getParkletOrganization(request, organizationId) {
  const result = await fetchParkletAdminJson(request, {
    path: `/parklet-admin-api/organizations/${encodeURIComponent(organizationId)}`,
    method: 'GET',
  });

  return {
    ...result,
    safeBody: result.response.ok ? normalizeParkletOrganization(result.body) : safeErrorBody(result.body),
  };
}

export async function listParkletParkingAreas(request, status) {
  const result = await fetchParkletAdminJson(request, {
    path: `/parklet-admin-api/parking-areas?status=${encodeURIComponent(status)}`,
    method: 'GET',
  });

  return {
    ...result,
    safeBody: result.response.ok ? normalizeParkletParkingAreaPage(result.body) : safeErrorBody(result.body),
  };
}

export async function getParkletParkingArea(request, parkingAreaId) {
  const result = await fetchParkletAdminJson(request, {
    path: `/parklet-admin-api/parking-areas/${encodeURIComponent(parkingAreaId)}`,
    method: 'GET',
  });

  return {
    ...result,
    safeBody: result.response.ok ? normalizeParkletParkingArea(result.body) : safeErrorBody(result.body),
  };
}

export function approveParkletOrganization(request, organizationId) {
  return executeFixedParkletAction(request, PARKLET_APPROVE_ORGANIZATION_SCRIPT_PATH, {
    organizationId,
  });
}

export function denyParkletOrganization(request, organizationId, reason) {
  return executeFixedParkletAction(request, PARKLET_DENY_ORGANIZATION_SCRIPT_PATH, {
    organizationId,
    reason,
  });
}

export function reactivateParkletOrganization(request, organizationId, reason) {
  return executeFixedParkletAction(request, PARKLET_REACTIVATE_ORGANIZATION_SCRIPT_PATH, {
    organizationId,
    reason,
  });
}

export function approveParkletParkingArea(request, parkingAreaId) {
  return executeFixedParkletAction(request, PARKLET_APPROVE_PARKING_AREA_SCRIPT_PATH, {
    parkingAreaId,
  });
}

export function rejectParkletParkingArea(request, parkingAreaId, reason) {
  return executeFixedParkletAction(request, PARKLET_REJECT_PARKING_AREA_SCRIPT_PATH, {
    parkingAreaId,
    reason,
  });
}

async function executeFixedParkletAction(request, scriptPath, payload) {
  const result = await callFixedParkletScript(request, {
    path: scriptPath,
    payload,
  });

  return {
    ...result,
    body: safeScriptBody(result),
  };
}

function safeScriptBody(result) {
  if (result.body && typeof result.body === 'object' && !Array.isArray(result.body)) {
    const body = result.body;
    return compactObject({
      ok: typeof body.ok === 'boolean' ? body.ok : result.ok,
      organizationId: firstSafeIdentifier(body.organizationId),
      parkingAreaId: firstSafeIdentifier(body.parkingAreaId),
      previousStatus: firstSafeMessage(body.previousStatus),
      status: firstSafeMessage(body.status),
      alreadyActive: typeof body.alreadyActive === 'boolean' ? body.alreadyActive : undefined,
      error: firstSafeMessage(body.error, body.message, body.Message),
      outcome: firstSafeMessage(body.outcome),
    });
  }

  if (result.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    error: firstSafeMessage(result.errorBody, result.body) || 'Neuron-anropet gav inget bekräftat svar.',
    ...(result.httpStatus === 502 ? { outcome: 'unknown' } : {}),
  };
}

export function safeErrorBody(body) {
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const message = firstSafeMessage(body.error, body.message, body.Message);
    return {
      ok: false,
      ...(message ? { error: message } : { error: 'Parklet Admin API-anropet misslyckades.' }),
    };
  }

  const message = firstSafeMessage(body);
  return {
    ok: false,
    error: message || 'Parklet Admin API-anropet misslyckades.',
  };
}

function firstSafeIdentifier(value) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().slice(0, 100);
  return normalized || undefined;
}

function firstSafeMessage(...values) {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const normalized = value.trim().replace(/[\r\n\t]+/g, ' ').slice(0, 300);
    if (normalized) return normalized;
  }
  return '';
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== '' && fieldValue !== undefined),
  );
}
