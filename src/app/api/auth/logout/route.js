import { NextResponse } from 'next/server';
import { clearNeuronSessionCookies } from '@/lib/neuronSessionContext';

export async function GET() {
    const response = NextResponse.json({ success: true });
    await clearNeuronSessionCookies(response, { clearAll: true });
    return response;
}
