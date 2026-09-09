import { NextResponse } from 'next/server';
import { getCurrentNeuronSummary } from '@/lib/neuronSessionContext';

export async function GET(request) {
  const summary = await getCurrentNeuronSummary(request);
  return NextResponse.json(summary, { status: 200 });
}
