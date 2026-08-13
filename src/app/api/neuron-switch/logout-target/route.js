import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ensureTargetHostAllowed, getNeuronReferences } from '@/lib/neuronSwitchProduction';
import {
  getDefaultNeuronHost,
  getNeuronSessionCookieValue,
  clearNeuronSessionCookies,
  setNeuronSessionCookies,
} from '@/lib/neuronSessionContext';

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const references = await getNeuronReferences(request);
    const host = ensureTargetHostAllowed(requestBody?.host, references);
    const cookieStore = await cookies();
    const activeHost = cookieStore.get('neuro-admin-active-neuron-host')?.value || '';
    const defaultHost = getDefaultNeuronHost();

    const response = NextResponse.json(
      {
        clearedHost: host,
        success: true,
      },
      { status: 200 },
    );

    await clearNeuronSessionCookies(response, {
      host,
      clearLegacyIfActive: true,
      clearActiveHostIfMatches: true,
    });

    if (host === activeHost && host !== defaultHost) {
      const defaultSession = await getNeuronSessionCookieValue(defaultHost);
      if (defaultSession) {
        await setNeuronSessionCookies(response, {
          host: defaultHost,
          sessionCookieValue: defaultSession,
          activate: true,
        });
      }
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to clear the stored target session.',
      },
      { status: 500 },
    );
  }
}
