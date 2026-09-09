import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(request) {
    try {
        const { response, body: data } = await fetchActiveNeuronJson(request, {
            path: '/settings/PeerReview.ws',
            payload: {},
        });

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const sortedKeys = [
            "allowPeerReview",
            "nrReviewersToApprove",
            "nrPhotosRequired",
            "requireFirstName",
            "requireMiddleName",
            "requireLastName",
            "requirePersonalNumber",
            "requireCountry",
            "requireRegion",
            "requireCity",
            "requireArea",
            "requirePostalCode",
            "requireAddress",
            "requireIso3166Compliance",
            "requireNationality",
            "requireGender",
            "requireBirthDate"
        ];

        const sortedData = {};
        for (const key of sortedKeys) {
            if (key in data) {
                sortedData[key] = data[key];
            }
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Peer review settings fetched', sortedData)), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
            status: statusCode,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
