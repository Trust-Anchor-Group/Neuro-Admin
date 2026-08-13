import { NextResponse } from 'next/server';
import { isParkingReviewStatus } from '@/lib/parkletAdmin.mjs';
import { listParkletParkingAreas } from '@/lib/server/parkletAdmin';

export async function GET(request) {
  const requestedStatus = new URL(request.url).searchParams.get('status');

  if (!isParkingReviewStatus(requestedStatus)) {
    return noStoreJson({ ok: false, error: 'Ogiltigt statusfilter för parkeringar.' }, 400);
  }

  try {
    const result = await listParkletParkingAreas(request, requestedStatus);
    return noStoreJson(result.safeBody, result.response.status);
  } catch (error) {
    return noStoreJson(
      { ok: false, error: 'Kunde inte läsa parkeringar.' },
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
