import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  ORGANIZATION_REVIEW_STATUSES,
  PARKING_REVIEW_STATUSES,
  PARKLET_APPROVE_ORGANIZATION_SCRIPT_PATH,
  PARKLET_APPROVE_PARKING_AREA_SCRIPT_PATH,
  PARKLET_DENY_ORGANIZATION_SCRIPT_PATH,
  PARKLET_REACTIVATE_ORGANIZATION_SCRIPT_PATH,
  PARKLET_REJECT_PARKING_AREA_SCRIPT_PATH,
  getOrganizationStatusLabel,
  getParkingStatusLabel,
  isParkletId,
  normalizeParkletOrganization,
  normalizeParkletOrganizationPage,
  normalizeParkletParkingArea,
  normalizeParkletParkingAreaPage,
  validateParkletActionPayload,
} from '../src/lib/parkletAdmin.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readProjectFile = (relativePath) => readFile(path.join(projectRoot, relativePath), 'utf8');
const organizationId = 'fcda58a4-e3f9-4192-87cc-038dd1db8127';
const parkingAreaId = '243f2b8f-f4ac-4abe-8f33-cc14bf73ce0f';

test('normalizes real organization fields without passing unknown data through', () => {
  const organization = normalizeParkletOrganization({
    Id: organizationId,
    PrincipalId: 'principal-42',
    Name: 'Testorganisation',
    RegistrationNumber: '559999-0000',
    Description: 'Beskrivning',
    Email: 'admin@example.test',
    AvatarUrl: 'https://cdn.example.test/avatar.png',
    Type: 'Organization',
    Status: 'Pending',
    CreatedAt: '2026-08-10T10:00:00Z',
    UpdatedAt: '2026-08-11T10:00:00Z',
    AccessToken: 'must not pass through',
  });

  assert.deepEqual(organization, {
    id: organizationId,
    principalId: 'principal-42',
    name: 'Testorganisation',
    registrationNumber: '559999-0000',
    description: 'Beskrivning',
    email: 'admin@example.test',
    avatarUrl: 'https://cdn.example.test/avatar.png',
    type: 'Organization',
    status: 'Pending',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-11T10:00:00Z',
  });
  assert.equal('AccessToken' in organization, false);
});

test('normalizes real parking detail, geometry, squares, and safe photo URLs', () => {
  const parking = normalizeParkletParkingArea({
    Id: parkingAreaId,
    PrincipalId: '2f1430cb-839a-4ac3-bdc4-c408f7654115',
    Status: 'Pending',
    Address: 'Storgatan 1, Stockholm',
    Description: 'Garage',
    Mode: 'Enumerated',
    ApprovalMode: 'Manual',
    ParkingVisibility: 'Private',
    Capacity: 2,
    RequiresAccessCode: true,
    RequiresKeyFob: false,
    PhotoUrls: ['https://cdn.example.test/parking.jpg', 'javascript:alert(1)'],
    Center: { Latitude: 59.33, Longitude: 18.06 },
    Boundary: { Corners: [
      { Latitude: 59.33, Longitude: 18.06 },
      { Latitude: 59.34, Longitude: 18.06 },
      { Latitude: 59.34, Longitude: 18.07 },
    ] },
    Squares: [{
      Id: '9bf66f76-0753-4a6a-b448-2ca97faf250c',
      ParkingAreaId: parkingAreaId,
      QueueId: 'e87be4aa-c957-4c52-a458-256331500fdb',
      Label: 'A1',
      Center: { Latitude: 59.335, Longitude: 18.065 },
      UpdatedAt: '2026-08-11T10:00:00Z',
    }],
    SecretAccessCode: 'must not pass through',
  });

  assert.equal(parking.address, 'Storgatan 1, Stockholm');
  assert.equal(parking.principalId, '2f1430cb-839a-4ac3-bdc4-c408f7654115');
  assert.equal(parking.capacity, 2);
  assert.equal(parking.requiresAccessCode, true);
  assert.equal(parking.requiresKeyFob, false);
  assert.deepEqual(parking.photoUrls, ['https://cdn.example.test/parking.jpg']);
  assert.equal(parking.boundary.corners.length, 3);
  assert.equal(parking.squares[0].label, 'A1');
  assert.equal(parking.squares[0].parkingAreaId, parkingAreaId);
  assert.equal(parking.squares[0].queueId, 'e87be4aa-c957-4c52-a458-256331500fdb');
  assert.equal('SecretAccessCode' in parking, false);
});

test('normalizes organization and parking paged responses', () => {
  const organizations = normalizeParkletOrganizationPage({
    Items: [{ Id: organizationId, Status: 'Active' }],
    More: true,
  });
  const parkingAreas = normalizeParkletParkingAreaPage({
    data: { items: [{ id: parkingAreaId, status: 'Approved' }], more: false },
  });
  assert.equal(organizations.items[0].status, 'Active');
  assert.equal(organizations.more, true);
  assert.equal(parkingAreas.items[0].status, 'Approved');
  assert.equal(parkingAreas.more, false);
});

test('defines every real status and Swedish status label', () => {
  assert.deepEqual(ORGANIZATION_REVIEW_STATUSES, ['Pending', 'Active', 'Denied', 'Deactivated']);
  assert.deepEqual(PARKING_REVIEW_STATUSES, ['Pending', 'Approved', 'Rejected']);
  assert.equal(getOrganizationStatusLabel('Pending'), 'Väntar på granskning');
  assert.equal(getOrganizationStatusLabel('Active'), 'Aktiv');
  assert.equal(getOrganizationStatusLabel('Denied'), 'Nekad');
  assert.equal(getOrganizationStatusLabel('Deactivated'), 'Inaktiverad');
  assert.equal(getParkingStatusLabel('Approved'), 'Godkänd');
  assert.equal(getParkingStatusLabel('Rejected'), 'Nekad');
});

test('validates UUIDs and exact allowlisted action payloads', () => {
  assert.equal(isParkletId(organizationId), true);
  assert.equal(isParkletId('not-a-uuid'), false);

  assert.deepEqual(validateParkletActionPayload(
    { organizationId },
    { idField: 'organizationId', idValue: organizationId },
  ), { ok: true, payload: { organizationId } });

  assert.equal(validateParkletActionPayload(
    { organizationId, scriptPath: '/evil.ws' },
    { idField: 'organizationId', idValue: organizationId },
  ).ok, false);
  assert.equal(validateParkletActionPayload(
    { organizationId: parkingAreaId },
    { idField: 'organizationId', idValue: organizationId },
  ).ok, false);
  assert.equal(validateParkletActionPayload(
    { organizationId, reason: '   ' },
    { idField: 'organizationId', idValue: organizationId, requiresReason: true },
  ).ok, false);
  assert.deepEqual(validateParkletActionPayload(
    { organizationId, reason: '  Saknar underlag  ' },
    { idField: 'organizationId', idValue: organizationId, requiresReason: true },
  ), { ok: true, payload: { organizationId, reason: 'Saknar underlag' } });
});

test('organization status tabs call the server-filtered read BFF and detail uses the real ID', async () => {
  const [client, listRoute, server] = await Promise.all([
    readProjectFile('src/components/parklet/ParkletOrganizationsClient.jsx'),
    readProjectFile('src/app/api/admin/organizations/route.js'),
    readProjectFile('src/lib/server/parkletAdmin.js'),
  ]);
  for (const status of ORGANIZATION_REVIEW_STATUSES) assert.match(client, new RegExp(`status: '${status}'`));
  assert.match(client, /api\/admin\/organizations\?status=\$\{encodeURIComponent\(status\)\}/);
  assert.match(client, /cache: 'no-store'/);
  assert.doesNotMatch(client, /\.filter\([^)]*(Pending|Active|Denied|Deactivated)/);
  assert.match(listRoute, /isOrganizationReviewStatus\(requestedStatus\)/);
  assert.match(server, /parklet-admin-api\/organizations\?status=\$\{encodeURIComponent\(status\)\}/);
  assert.match(client, /api\/admin\/organizations\/\$\{encodeURIComponent\(organizationId\)\}/);
  assert.match(server, /parklet-admin-api\/organizations\/\$\{encodeURIComponent\(organizationId\)\}/);
});

test('organization action visibility matches Pending, Active, Denied, and Deactivated', async () => {
  const source = await readProjectFile('src/components/parklet/ParkletOrganizationsClient.jsx');
  assert.match(source, /if \(status === 'Pending'\)[\s\S]*Godkänn organisation[\s\S]*Neka organisation/);
  assert.match(source, /status === 'Denied' \|\| status === 'Deactivated'/);
  assert.match(source, /Återaktivera organisation/);
  assert.match(source, /Inga granskningsåtgärder för den här statusen/);
  assert.doesNotMatch(source, /status === 'Active'[\s\S]{0,200}Godkänn organisation/);
});

test('organization confirmations, required reasons, cancel, and single-flight are enforced', async () => {
  const [client, dialog] = await Promise.all([
    readProjectFile('src/components/parklet/ParkletOrganizationsClient.jsx'),
    readProjectFile('src/components/parklet/ParkletReviewUi.jsx'),
  ]);
  assert.match(client, /Godkänn organisation\?/);
  assert.match(client, /Neka organisation\?/);
  assert.match(client, /Återaktivera organisation\?/);
  assert.match(client, /reasonRequired: true/g);
  assert.match(dialog, /Anledning/);
  assert.match(dialog, /disabled=\{busy \|\| !reasonIsValid\}/);
  assert.match(dialog, /onClick=\{onCancel\}/);
  assert.match(client, /mutationRef\.current = true/);
  assert.ok(client.indexOf('mutationRef.current = true') < client.lastIndexOf('await fetch('));
  assert.match(client, /if \([\s\S]*mutationRef\.current[\s\S]*\) return/);
});

test('organization BFF routes map to only the three fixed organization scripts and payloads', async () => {
  assert.equal(PARKLET_APPROVE_ORGANIZATION_SCRIPT_PATH, '/ParkletAdmin/activateOrg.ws');
  assert.equal(PARKLET_DENY_ORGANIZATION_SCRIPT_PATH, '/ParkletAdmin/denyOrg.ws');
  assert.equal(PARKLET_REACTIVATE_ORGANIZATION_SCRIPT_PATH, '/ParkletAdmin/reactivate.ws');
  const [approve, deny, reactivate, server] = await Promise.all([
    readProjectFile('src/app/api/admin/organizations/[organizationId]/approve/route.js'),
    readProjectFile('src/app/api/admin/organizations/[organizationId]/deny/route.js'),
    readProjectFile('src/app/api/admin/organizations/[organizationId]/reactivate/route.js'),
    readProjectFile('src/lib/server/parkletAdmin.js'),
  ]);
  assert.match(approve, /approveParkletOrganization\(request, organizationId\)/);
  assert.match(deny, /denyParkletOrganization\(request, organizationId, parsed\.payload\.reason\)/);
  assert.match(reactivate, /reactivateParkletOrganization\(request, organizationId, parsed\.payload\.reason\)/);
  assert.match(server, /PARKLET_APPROVE_ORGANIZATION_SCRIPT_PATH, \{\s*organizationId,/);
  assert.match(server, /PARKLET_DENY_ORGANIZATION_SCRIPT_PATH, \{\s*organizationId,\s*reason,/);
  assert.match(server, /PARKLET_REACTIVATE_ORGANIZATION_SCRIPT_PATH, \{\s*organizationId,\s*reason,/);
  for (const route of [approve, deny, reactivate]) {
    assert.doesNotMatch(route, /payload\.(script|scriptName|scriptPath|source|code|wsFile)/);
  }
});

test('organization mutations refetch affected status lists and detail without optimistic state', async () => {
  const source = await readProjectFile('src/components/parklet/ParkletOrganizationsClient.jsx');
  assert.match(source, /\['Pending', 'Active'\]/);
  assert.match(source, /\['Pending', 'Denied'\]/);
  assert.match(source, /\[sourceStatus, 'Active'\]/);
  assert.match(source, /Promise\.allSettled\(\[/);
  assert.match(source, /loadOrganizations\(status\)/);
  assert.match(source, /loadOrganization\(organizationId\)/);
  assert.doesNotMatch(source, /setLists\([^\n]*filter/);
  assert.doesNotMatch(source, /setOrganization\([^\n]*status/);
  assert.equal((source.match(/\$\{action\.endpoint\}/g) || []).length, 1);
});

test('parking tabs use the real filtered reads and detail endpoint', async () => {
  const [client, listRoute, server] = await Promise.all([
    readProjectFile('src/components/parklet/ParkletParkingAreasClient.jsx'),
    readProjectFile('src/app/api/admin/parking-areas/route.js'),
    readProjectFile('src/lib/server/parkletAdmin.js'),
  ]);
  for (const status of PARKING_REVIEW_STATUSES) assert.match(client, new RegExp(`status: '${status}'`));
  assert.match(client, /api\/admin\/parking-areas\?status=\$\{encodeURIComponent\(status\)\}/);
  assert.match(listRoute, /isParkingReviewStatus\(requestedStatus\)/);
  assert.match(server, /parklet-admin-api\/parking-areas\?status=\$\{encodeURIComponent\(status\)\}/);
  assert.match(client, /api\/admin\/parking-areas\/\$\{encodeURIComponent\(parkingAreaId\)\}/);
  assert.match(server, /parklet-admin-api\/parking-areas\/\$\{encodeURIComponent\(parkingAreaId\)\}/);
  assert.doesNotMatch(client, /\.filter\([^)]*(Pending|Approved|Rejected)/);
});

test('parking review renders safe detail, geometry, squares, and Pending-only actions', async () => {
  const source = await readProjectFile('src/components/parklet/ParkletParkingAreasClient.jsx');
  assert.match(source, /parkingArea\.status === 'Pending'/);
  assert.match(source, /Godkänn parkering/);
  assert.match(source, /Neka parkering/);
  assert.match(source, /Inga granskningsåtgärder för den här statusen/);
  assert.match(source, /GeometryPreview/);
  assert.match(source, /Numrerade platser/);
  assert.match(source, /Godkännandet gäller parkeringsområdet/);
  assert.doesNotMatch(source, /(rawAccessCode|SecretAccessCode|keyFobSecret|authToken|jwtToken)/i);
});

test('parking BFF routes map to only the two fixed parking scripts and exact payloads', async () => {
  assert.equal(PARKLET_APPROVE_PARKING_AREA_SCRIPT_PATH, '/ParkletAdmin/parkingApprove.ws');
  assert.equal(PARKLET_REJECT_PARKING_AREA_SCRIPT_PATH, '/ParkletAdmin/parkingReject.ws');
  const [approve, reject, server] = await Promise.all([
    readProjectFile('src/app/api/admin/parking-areas/[parkingAreaId]/approve/route.js'),
    readProjectFile('src/app/api/admin/parking-areas/[parkingAreaId]/reject/route.js'),
    readProjectFile('src/lib/server/parkletAdmin.js'),
  ]);
  assert.match(approve, /approveParkletParkingArea\(request, parkingAreaId\)/);
  assert.match(reject, /rejectParkletParkingArea\(request, parkingAreaId, parsed\.payload\.reason\)/);
  assert.match(server, /PARKLET_APPROVE_PARKING_AREA_SCRIPT_PATH, \{\s*parkingAreaId,/);
  assert.match(server, /PARKLET_REJECT_PARKING_AREA_SCRIPT_PATH, \{\s*parkingAreaId,\s*reason,/);
});

test('parking mutations are confirmed, single-flight, and reconciled by fresh reads', async () => {
  const source = await readProjectFile('src/components/parklet/ParkletParkingAreasClient.jsx');
  assert.match(source, /Godkänn parkering\?/);
  assert.match(source, /Neka parkering\?/);
  assert.match(source, /reasonRequired: true/);
  assert.match(source, /mutationRef\.current = true/);
  assert.ok(source.indexOf('mutationRef.current = true') < source.lastIndexOf('await fetch('));
  assert.match(source, /\['Pending', 'Approved'\]/);
  assert.match(source, /\['Pending', 'Rejected'\]/);
  assert.match(source, /loadParkingAreas\(status\)/);
  assert.match(source, /loadParkingArea\(parkingAreaId\)/);
  assert.doesNotMatch(source, /setLists\([^\n]*filter/);
  assert.doesNotMatch(source, /setParkingArea\([^\n]*status/);
  assert.equal((source.match(/\$\{action\.endpoint\}/g) || []).length, 1);
});

test('server forwards only HttpSessionID and browser exposes no auth or ws controls', async () => {
  const [server, transport, organizationClient, parkingClient] = await Promise.all([
    readProjectFile('src/lib/server/parkletAdmin.js'),
    readProjectFile('src/lib/server/parkletAdminTransport.js'),
    readProjectFile('src/components/parklet/ParkletOrganizationsClient.jsx'),
    readProjectFile('src/components/parklet/ParkletParkingAreasClient.jsx'),
  ]);
  assert.match(server, /callFixedParkletScript\(request/);
  assert.match(transport, /SESSION_COOKIE_NAME = 'HttpSessionID'/);
  assert.match(transport, /Cookie: buildParkletSessionCookie\(context\.sessionCookieValue\)/);
  assert.match(transport, /resolveAgentHost\(request\.headers\)/);
  for (const client of [organizationClient, parkingClient]) {
    assert.doesNotMatch(client, /Authorization|JWT|localStorage|sessionStorage|\.ws|scriptPath|scriptName/);
    assert.match(client, /response\.status === 401/);
    assert.match(client, /response\.status === 403/);
    assert.match(client, /UNKNOWN_OUTCOME_MESSAGE/);
  }
});

test('Parklet implementation does not depend on uncommitted Neuron switch modules', async () => {
  const sources = await Promise.all([
    readProjectFile('src/lib/server/parkletAdmin.js'),
    readProjectFile('src/lib/server/parkletAdminTransport.js'),
  ]);
  assert.doesNotMatch(
    sources.join('\n'),
    /neuronSessionContext|neuronSwitchProduction|neuronUpstream|neuron-switch/,
  );
});

test('admin action routes validate JSON, exact fields, reasons, and never expose a generic script route', async () => {
  const helper = await readProjectFile('src/lib/server/parkletAdminRequest.js');
  assert.match(helper, /includes\('application\/json'\)/);
  assert.match(helper, /MAX_REQUEST_BODY_BYTES/);
  assert.match(helper, /validateParkletActionPayload/);

  const files = await listFiles(path.join(projectRoot, 'src/app/api/admin'));
  const relativeFiles = files.map((file) => path.relative(projectRoot, file).replaceAll('\\', '/'));
  assert.equal(relativeFiles.some((file) => /run-script|scripts\/\[/.test(file)), false);
  assert.equal(relativeFiles.filter((file) => file.endsWith('/route.js')).length, 9);
});

test('landing card and Parklet navigation expose both review dashboards', async () => {
  const [landing, layout, parkingPage] = await Promise.all([
    readProjectFile('src/app/(landingpage)/landingpage/page.jsx'),
    readProjectFile('src/app/(dashboard)/parklet/layout.jsx'),
    readProjectFile('src/app/(dashboard)/parklet/parkeringar/page.jsx'),
  ]);
  assert.match(landing, /title: 'Parklet'/);
  assert.match(landing, /href: '\/parklet'/);
  assert.match(landing, /Granska Parklet-organisationer och parkeringsomr\\u00e5den/);
  assert.match(layout, /Organisationer/);
  assert.match(layout, /href: '\/parklet\/parkeringar'/);
  assert.match(parkingPage, /ParkletParkingAreasClient/);
});

test('safe 401, 403, validation, unknown-outcome, and no-auto-retry messaging is present', async () => {
  const [organizationClient, parkingClient, ui] = await Promise.all([
    readProjectFile('src/components/parklet/ParkletOrganizationsClient.jsx'),
    readProjectFile('src/components/parklet/ParkletParkingAreasClient.jsx'),
    readProjectFile('src/components/parklet/ParkletReviewUi.jsx'),
  ]);
  assert.match(ui, /Du har inte behörighet att utföra den här åtgärden/);
  assert.match(ui, /Det gick inte att bekräfta om ändringen genomfördes/);
  assert.match(organizationClient, /safeBackendMessage\(body\)/);
  assert.match(parkingClient, /safeBackendMessage\(body\)/);
  assert.equal((organizationClient.match(/\$\{action\.endpoint\}/g) || []).length, 1);
  assert.equal((parkingClient.match(/\$\{action\.endpoint\}/g) || []).length, 1);
});

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));
  return nested.flat();
}
