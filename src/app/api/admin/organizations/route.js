import { NextResponse } from 'next/server';
import { isOrganizationReviewStatus } from '@/lib/parkletAdmin.mjs';
import { listParkletOrganizations } from '@/lib/server/parkletAdmin';

export async function GET(request) {
  const requestedStatus = new URL(request.url).searchParams.get('status');

  if (!isOrganizationReviewStatus(requestedStatus)) {
    return noStoreJson(
      { ok: false, error: 'Ogiltigt statusfilter för organisationer.' },
      400,
    );
  }

  try {
    const result = await listParkletOrganizations(request, requestedStatus);
    return noStoreJson(result.safeBody, result.response.status);
  } catch (error) {
    return noStoreJson(
      { ok: false, error: 'Kunde inte läsa organisationer.' },
      error?.statusCode || 502,
    );
  }
}

function noStoreJson(body, status) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
