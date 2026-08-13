import { NextResponse } from 'next/server';
import { isParkletOrganizationId } from '@/lib/parkletAdmin.mjs';
import { denyParkletOrganization } from '@/lib/server/parkletAdmin';
import { parseParkletActionRequest } from '@/lib/server/parkletAdminRequest';

export async function POST(request, { params }) {
  const { organizationId } = await params;

  if (!isParkletOrganizationId(organizationId)) {
    return noStoreJson({ ok: false, error: 'Ogiltigt organisations-ID.' }, 400);
  }

  const parsed = await parseParkletActionRequest(request, {
    idField: 'organizationId',
    idValue: organizationId,
    requiresReason: true,
  });
  if (!parsed.ok) return noStoreJson({ ok: false, error: parsed.error }, parsed.status);

  try {
    const result = await denyParkletOrganization(request, organizationId, parsed.payload.reason);
    return noStoreJson(result.body, result.httpStatus);
  } catch (error) {
    return unknownOutcome(error);
  }
}

function unknownOutcome(error) {
  return noStoreJson(
    { ok: false, error: 'Det gick inte att bekräfta resultatet från Neuron.', outcome: 'unknown' },
    error?.statusCode || 502,
  );
}

function noStoreJson(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
