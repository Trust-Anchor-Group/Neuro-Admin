export const PARKLET_PENDING_STATUS = 'Pending';
export const MAX_PARKLET_REASON_LENGTH = 500;

export const ORGANIZATION_REVIEW_STATUSES = Object.freeze([
  'Pending',
  'Active',
  'Denied',
  'Deactivated',
]);

export const PARKING_REVIEW_STATUSES = Object.freeze([
  'Pending',
  'Approved',
  'Rejected',
]);

export const PARKLET_SCRIPT_PATHS = Object.freeze({
  approveOrganization: '/ParkletAdmin/activateOrg.ws',
  denyOrganization: '/ParkletAdmin/denyOrg.ws',
  reactivateOrganization: '/ParkletAdmin/reactivate.ws',
  approveParkingArea: '/ParkletAdmin/parkingApprove.ws',
  rejectParkingArea: '/ParkletAdmin/parkingReject.ws',
});

// Kept as named exports because they make every route-to-script mapping auditable.
export const PARKLET_APPROVE_ORGANIZATION_SCRIPT = 'Parklet.Admin.Organizations.Approve';
export const PARKLET_APPROVE_ORGANIZATION_SCRIPT_PATH = PARKLET_SCRIPT_PATHS.approveOrganization;
export const PARKLET_DENY_ORGANIZATION_SCRIPT_PATH = PARKLET_SCRIPT_PATHS.denyOrganization;
export const PARKLET_REACTIVATE_ORGANIZATION_SCRIPT_PATH = PARKLET_SCRIPT_PATHS.reactivateOrganization;
export const PARKLET_APPROVE_PARKING_AREA_SCRIPT_PATH = PARKLET_SCRIPT_PATHS.approveParkingArea;
export const PARKLET_REJECT_PARKING_AREA_SCRIPT_PATH = PARKLET_SCRIPT_PATHS.rejectParkingArea;

export const ORGANIZATION_STATUS_LABELS = Object.freeze({
  Pending: 'Väntar på granskning',
  Active: 'Aktiv',
  Denied: 'Nekad',
  Deactivated: 'Inaktiverad',
});

export const PARKING_STATUS_LABELS = Object.freeze({
  Pending: 'Väntar på granskning',
  Approved: 'Godkänd',
  Rejected: 'Nekad',
});

const ORGANIZATION_STATUS_STYLES = Object.freeze({
  Pending: 'border-amber-200 bg-amber-50 text-amber-800',
  Active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Denied: 'border-red-200 bg-red-50 text-red-800',
  Deactivated: 'border-slate-200 bg-slate-100 text-slate-700',
});

const PARKING_STATUS_STYLES = Object.freeze({
  Pending: 'border-amber-200 bg-amber-50 text-amber-800',
  Approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Rejected: 'border-red-200 bg-red-50 text-red-800',
});

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isParkletId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value.trim());
}

export const isParkletOrganizationId = isParkletId;
export const isParkletParkingAreaId = isParkletId;

export function isOrganizationReviewStatus(value) {
  return ORGANIZATION_REVIEW_STATUSES.includes(value);
}

export function isParkingReviewStatus(value) {
  return PARKING_REVIEW_STATUSES.includes(value);
}

export function validateParkletActionPayload(payload, {
  idField,
  idValue,
  requiresReason = false,
}) {
  if (!isRecord(payload)) {
    return { ok: false, error: 'Begäran måste vara ett JSON-objekt.' };
  }

  const allowedFields = requiresReason ? new Set([idField, 'reason']) : new Set([idField]);
  const fields = Object.keys(payload);
  if (
    fields.length !== allowedFields.size ||
    fields.some((field) => !allowedFields.has(field)) ||
    payload[idField] !== idValue
  ) {
    return {
      ok: false,
      error: requiresReason
        ? `Begäran får endast innehålla matchande ${idField} och reason.`
        : `Begäran får endast innehålla matchande ${idField}.`,
    };
  }

  if (!requiresReason) {
    return { ok: true, payload: { [idField]: idValue } };
  }

  if (typeof payload.reason !== 'string' || !payload.reason.trim()) {
    return { ok: false, error: 'Anledning krävs.' };
  }

  const reason = payload.reason.trim();
  if (reason.length > MAX_PARKLET_REASON_LENGTH) {
    return {
      ok: false,
      error: `Anledningen får vara högst ${MAX_PARKLET_REASON_LENGTH} tecken.`,
    };
  }

  return { ok: true, payload: { [idField]: idValue, reason } };
}

export function getOrganizationStatusLabel(status) {
  return ORGANIZATION_STATUS_LABELS[status] || status || 'Okänd';
}

export function getOrganizationStatusStyle(status) {
  return ORGANIZATION_STATUS_STYLES[status] || 'border-slate-200 bg-slate-100 text-slate-700';
}

export function getParkingStatusLabel(status) {
  return PARKING_STATUS_LABELS[status] || status || 'Okänd';
}

export function getParkingStatusStyle(status) {
  return PARKING_STATUS_STYLES[status] || 'border-slate-200 bg-slate-100 text-slate-700';
}

export function normalizeParkletOrganization(value) {
  if (!isRecord(value)) return null;

  const id = firstString(value.id, value.Id, value.organization_id, value.organizationId);
  if (!isParkletOrganizationId(id)) return null;

  return compactObject({
    id,
    principalId: firstString(value.principal_id, value.principalId, value.PrincipalId),
    name: firstString(value.name, value.Name),
    registrationNumber: firstString(
      value.registration_number,
      value.registrationNumber,
      value.RegistrationNumber,
    ),
    description: firstString(value.description, value.Description),
    email: firstString(value.email, value.Email),
    avatarUrl: firstHttpUrl(value.avatar_url, value.avatarUrl, value.AvatarUrl),
    type: firstString(value.type, value.Type),
    status: firstString(value.status, value.Status),
    createdAt: firstString(value.created_at, value.createdAt, value.CreatedAt),
    updatedAt: firstString(value.updated_at, value.updatedAt, value.UpdatedAt),
  });
}

export function normalizeParkletOrganizationPage(value) {
  return normalizePage(value, normalizeParkletOrganization, ['organizations', 'Organizations']);
}

export function normalizeParkletParkingArea(value) {
  if (!isRecord(value)) return null;

  const id = firstString(value.id, value.Id, value.parking_area_id, value.parkingAreaId);
  if (!isParkletParkingAreaId(id)) return null;

  const rawSquares = firstArray(value.squares, value.Squares);

  return compactObject({
    id,
    principalId: firstString(value.principal_id, value.principalId, value.PrincipalId),
    status: firstString(value.status, value.Status),
    address: normalizeAddress(value.address ?? value.Address),
    locationTypeId: firstString(value.location_type_id, value.locationTypeId, value.LocationTypeId),
    groupId: firstString(value.group_id, value.groupId, value.GroupId),
    description: firstString(value.description, value.Description),
    photoUrls: firstArray(value.photo_urls, value.photoUrls, value.PhotoUrls)
      .map((url) => firstHttpUrl(url))
      .filter(Boolean),
    parkingVisibility: firstString(
      value.parking_visibility,
      value.parkingVisibility,
      value.ParkingVisibility,
    ),
    mode: firstString(value.mode, value.Mode),
    approvalMode: firstString(value.approval_mode, value.approvalMode, value.ApprovalMode),
    boundary: normalizeBoundary(value.boundary ?? value.Boundary),
    center: normalizeCoordinate(value.center ?? value.Center),
    capacity: firstNumber(value.capacity, value.Capacity),
    requiresAccessCode: firstBoolean(
      value.requires_access_code,
      value.requiresAccessCode,
      value.RequiresAccessCode,
    ),
    requiresKeyFob: firstBoolean(
      value.requires_key_fob,
      value.requiresKeyFob,
      value.RequiresKeyFob,
    ),
    squares: rawSquares.map(normalizeParkingSquare).filter(Boolean),
    createdAt: firstString(value.created_at, value.createdAt, value.CreatedAt),
    updatedAt: firstString(value.updated_at, value.updatedAt, value.UpdatedAt),
  });
}

export function normalizeParkletParkingAreaPage(value) {
  return normalizePage(value, normalizeParkletParkingArea, ['parkingAreas', 'ParkingAreas']);
}

function normalizeParkingSquare(value) {
  if (!isRecord(value)) return null;
  const id = firstString(value.id, value.Id);
  if (!isParkletId(id)) return null;

  return compactObject({
    id,
    parkingAreaId: firstString(value.parking_area_id, value.parkingAreaId, value.ParkingAreaId),
    label: firstString(value.label, value.Label),
    queueId: firstString(value.queue_id, value.queueId, value.QueueId),
    boundary: normalizeBoundary(value.boundary ?? value.Boundary),
    center: normalizeCoordinate(value.center ?? value.Center),
    createdAt: firstString(value.created_at, value.createdAt, value.CreatedAt),
    updatedAt: firstString(value.updated_at, value.updatedAt, value.UpdatedAt),
  });
}

function normalizeBoundary(value) {
  if (!isRecord(value)) return undefined;
  const corners = firstArray(value.corners, value.Corners)
    .map(normalizeCoordinate)
    .filter(Boolean);
  return corners.length ? { corners } : undefined;
}

function normalizeCoordinate(value) {
  if (!isRecord(value)) return null;
  const latitude = firstNumber(value.latitude, value.Latitude, value.lat, value.Lat);
  const longitude = firstNumber(value.longitude, value.Longitude, value.lng, value.Lng, value.lon);
  if (latitude === undefined || longitude === undefined) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

function normalizeAddress(value) {
  if (typeof value === 'string') return value.trim();
  if (!isRecord(value)) return '';
  return firstString(
    value.formatted,
    value.Formatted,
    value.fullAddress,
    value.FullAddress,
    value.addressLine,
    value.AddressLine,
    [value.street ?? value.Street, value.city ?? value.City].filter(Boolean).join(', '),
  );
}

function normalizePage(value, normalizer, collectionKeys) {
  const rawItems = extractItems(value, normalizer, collectionKeys);
  return {
    items: rawItems.flatMap((item) => {
      const normalized = normalizer(item);
      return normalized ? [normalized] : [];
    }),
    more: readBoolean(value, ['more', 'More']) ?? false,
  };
}

function extractItems(value, normalizer, collectionKeys) {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];

  for (const key of ['items', 'Items', ...collectionKeys, 'data', 'Data', 'result', 'Result']) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate;
    if (isRecord(candidate)) {
      const nested = extractItems(candidate, normalizer, collectionKeys);
      if (nested.length) return nested;
    }
  }

  return normalizer(value) ? [value] : [];
}

function readBoolean(value, keys) {
  if (!isRecord(value)) return null;
  for (const key of keys) {
    if (typeof value[key] === 'boolean') return value[key];
  }
  for (const key of ['data', 'Data', 'result', 'Result']) {
    const nestedValue = readBoolean(value[key], keys);
    if (nestedValue !== null) return nestedValue;
  }
  return null;
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function firstHttpUrl(...values) {
  const candidate = firstString(...values);
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function firstNumber(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function firstBoolean(...values) {
  for (const value of values) {
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}

function firstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== '' && fieldValue !== undefined),
  );
}
