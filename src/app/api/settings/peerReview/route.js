import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {
    try {
        const requestData = await request.json();
        const clientCookie = request.headers.get("Cookie");
        const { host } = config.api.agent;
        const url = `https://${host}/Settings/PeerReview`;

        const payload = {
            allowPeerReview: requestData.allowPeerReview ?? false,
            nrReviewersToApprove: requestData.nrReviewersToApprove ?? 1,
            nrPhotosRequired: requestData.nrPhotosRequired ?? 1,
            requireFirstName: requestData.requireFirstName ?? false,
            requireMiddleName: requestData.requireMiddleName ?? false,
            requireLastName: requestData.requireLastName ?? false,
            requirePersonalNumber: requestData.requirePersonalNumber ?? false,
            requireCountry: requestData.requireCountry ?? false,
            requireRegion: requestData.requireRegion ?? false,
            requireCity: requestData.requireCity ?? false,
            requireArea: requestData.requireArea ?? false,
            requirePostalCode: requestData.requirePostalCode ?? false,
            requireAddress: requestData.requireAddress ?? false,
            requireIso3166Compliance: requestData.requireIso3166Compliance ?? false,
            requireNationality: requestData.requireNationality ?? false,
            requireGender: requestData.requireGender ?? false,
            requireBirthDate: requestData.requireBirthDate ?? false
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": clientCookie
            },
            credentials: "include",
            body: JSON.stringify(payload),
            mode: "cors"
        });


        const contentType = response.headers.get("content-type") || "";
        let data = contentType.includes("application/json") ? await response.json() : await response.text();

        if (!response.ok) {
            console.error("❌ Error Response:", data);
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, "Peer Review settings successfully updated", data)), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("❌ Fetch error:", error);
        return new Response(JSON.stringify(new ResponseModel(500, error.message)), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
