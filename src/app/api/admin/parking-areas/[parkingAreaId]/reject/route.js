import { NextResponse } from 'next/server';
import { isParkletParkingAreaId } from '@/lib/parkletAdmin.mjs';
import { rejectParkletParkingArea } from '@/lib/server/parkletAdmin';
import { parseParkletActionRequest } from '@/lib/server/parkletAdminRequest';

export async function POST(request, { params }) {
  const { parkingAreaId } = await params;

  if (!isParkletParkingAreaId(parkingAreaId)) {
    return noStoreJson({ ok: false, error: 'Ogiltigt parkerings-ID.' }, 400);
  }

  const parsed = await parseParkletActionRequest(request, {
    idField: 'parkingAreaId',
    idValue: parkingAreaId,
    requiresReason: true,
  });
  if (!parsed.ok) return noStoreJson({ ok: false, error: parsed.error }, parsed.status);

  try {
    const result = await rejectParkletParkingArea(request, parkingAreaId, parsed.payload.reason);
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
