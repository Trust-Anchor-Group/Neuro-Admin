import { NextResponse } from 'next/server';
import { getNeuronReferences } from '@/lib/neuronSwitchProduction';

export async function GET(request) {
  try {
    const payload = await getNeuronReferences(request);
    const debugEnabled = process.env.NEXT_PUBLIC_NEURON_SWITCH_DEBUG === 'true';

    if (debugEnabled) {
      console.log('[NeuronSwitchReferences]', JSON.stringify({
        sourceHost: payload.debug?.sourceHost || null,
        hasSourceSession: payload.debug?.hasSourceSession || false,
        remoteReferencesCalled: payload.debug?.called || false,
        remoteReferencesStatus: payload.debug?.status || null,
        remoteReferencesOk: payload.debug?.ok || false,
        remoteReferencesResponseKeys: payload.debug?.responseKeys || [],
        remoteReferencesResponseBody: payload.debug?.responseBody ?? null,
        remoteReferencesAttempts: payload.debug?.attempts || [],
        parsedHosts: payload.debug?.parsedHosts || [],
        finalDropdownHosts: Array.isArray(payload.references)
          ? payload.references.map((reference) => reference.host)
          : [],
      }));
    }

    return NextResponse.json(
      debugEnabled
        ? payload
        : {
          activeHost: payload.activeHost,
          defaultHost: payload.defaultHost,
          references: payload.references,
          sourceHost: payload.sourceHost,
          canStartRemoteLogin: payload.canStartRemoteLogin,
        },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to load Neuron references.',
      },
      { status: 500 },
    );
  }
}
