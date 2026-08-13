import { NextResponse } from 'next/server';
import { isParkletParkingAreaId } from '@/lib/parkletAdmin.mjs';
import { getParkletParkingArea } from '@/lib/server/parkletAdmin';

export async function GET(request, { params }) {
  const { parkingAreaId } = await params;

  if (!isParkletParkingAreaId(parkingAreaId)) {
    return noStoreJson({ ok: false, error: 'Ogiltigt parkerings-ID.' }, 400);
  }

  try {
    const result = await getParkletParkingArea(request, parkingAreaId);
    if (result.response.ok && !result.safeBody) {
      return noStoreJson({ ok: false, error: 'Parkeringen kunde inte läsas.' }, 502);
    }
    return noStoreJson(result.safeBody, result.response.status);
  } catch (error) {
    return noStoreJson(
      { ok: false, error: 'Kunde inte läsa parkeringen.' },
      error?.statusCode || 502,
    );
  }
}

function noStoreJson(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
