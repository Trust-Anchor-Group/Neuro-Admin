import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {
	const clientCookie = request.headers.get('Cookie');
	const { host } = config.api.agent;
	const url = `https://${host}/settings/PeerReview.ws`;

	try {
		const response = await fetch(url, {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Cookie': clientCookie
			},
			credentials: 'include',
			mode: 'cors'
		});

		const contentType = response.headers.get('content-type');
		let data;

		if (contentType?.includes('application/json')) {
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
