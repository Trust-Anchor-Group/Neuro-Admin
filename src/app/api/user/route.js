import { NextResponse } from "next/server";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(req) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: 'Please provide with a userId' }, { status: 404 });
        }

        const { response: res, body: data } = await fetchActiveNeuronJson(req, {
            path: '/LegalIdentities.ws',
            payload: {
                maxCount: 20,
                offset: 0,
            },
        });

        if (!res.ok) {
            return NextResponse.json({ message: `Something went wrong ${res.statusText} - ${res.status}` });
        }

        const decodedUserId = decodeURIComponent(userId);
        const findId = Array.isArray(data)
            ? data.filter((user) => user.account === decodedUserId)
            : [];

        console.log('One User', findId);

        return NextResponse.json(findId, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: `Internal Server Error ${error}` }, { status: 500 });
    }
}
