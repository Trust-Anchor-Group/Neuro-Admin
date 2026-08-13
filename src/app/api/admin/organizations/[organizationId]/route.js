import { NextResponse } from 'next/server';
import { isParkletOrganizationId } from '@/lib/parkletAdmin.mjs';
import { getParkletOrganization } from '@/lib/server/parkletAdmin';

export async function GET(request, { params }) {
  const { organizationId } = await params;

  if (!isParkletOrganizationId(organizationId)) {
    return noStoreJson({ ok: false, error: 'Ogiltigt organisations-ID.' }, 400);
  }

  try {
    const result = await getParkletOrganization(request, organizationId);
    if (result.response.ok && !result.safeBody) {
      return noStoreJson({ ok: false, error: 'Organisationen kunde inte läsas.' }, 502);
    }
    return noStoreJson(result.safeBody, result.response.status);
  } catch (error) {
    return noStoreJson(
      { ok: false, error: 'Kunde inte läsa organisationen.' },
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
