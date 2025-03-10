import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {
    try {
        const requestData = await request.json();
        const clientCookie = request.headers.get('Cookie');
        const { host } = config.api.agent;
        const url = `https://${host}/Settings/PeerReview`;

        const payload = {
            allowPeerReview: requestData.allowPeerReview,
            nrReviewersToApprove: requestData.nrReviewersToApprove,
            nrPhotosRequired: requestData.nrPhotosRequired,
            requireFirstName: requestData.requireFirstName,
            requireMiddleName: requestData.requireMiddleName,
            requireLastName: requestData.requireLastName,
            requirePersonalNumber: requestData.requirePersonalNumber,
            requireCountry: requestData.requireCountry,
            requireRegion: requestData.requireRegion,
            requireCity: requestData.requireCity,
            requireArea: requestData.requireArea,
            requirePostalCode: requestData.requirePostalCode,
            requireAddress: requestData.requireAddress,
            requireIso3166Compliance: requestData.requireIso3166Compliance,
            requireNationality: requestData.requireNationality,
            requireGender: requestData.requireGender,
            requireBirthDate: requestData.requireBirthDate
        };
        console.log(payload)
        console.log(url)


        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie
            },
            credentials: 'include',
            body: JSON.stringify(payload),
            mode: 'cors'
        });
        console.log(response)
        if (!response) {
            return new Response(JSON.stringify(new ResponseModel(500, "No response received from the server")), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const contentType = response.headers?.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Peer Review settings successfully updated', data)), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Fetch error:", error);
        return new Response(JSON.stringify(new ResponseModel(500, error.message)), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
