import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

function formatDateOfBirth(properties) {
    if (properties.DOB || !properties.BDAY || !properties.BMONTH || !properties.BYEAR) {
        return properties.DOB;
    }

    const day = String(properties.BDAY).padStart(2, '0');
    const month = String(properties.BMONTH).padStart(2, '0');
    const year = String(properties.BYEAR);

    return `${year}-${month}-${day}`;
}

export async function POST(request) {
    const requestData = await request.json();
    const { legalIdentity } = requestData;
    const clientCookie = request.headers.get('Cookie');
    const decodedUserId = decodeURIComponent(legalIdentity);
    const { host } = config.api.agent;
    const url = `https://${host}/legalIdentity.ws`;

    const payload = { id: decodedUserId };
    console.log('LegalId Fetch', payload);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        const contentType = response.headers.get('content-type');
        let data;
        let filterData;

        if (contentType.includes('application/json')) {
            data = await response.json();
            console.log('Legal Identity Data', data);

            const properties = data.properties || {};

            filterData = {
                Id: data.id,
                account: data.account,
                created: data.created,
                updated: data.updated,
                state: data.state,
                provider: data.provider,
                from: data.from,
                to: data.to,
                nrPeerReviews: data.nrPeerReviews,
                version: data.version,
                attachments: Array.isArray(data.attachments)
                    ? data.attachments.map(a => ({
                        data: a.data,
                        fileName: a.FileName
                    }))
                    : [],
                properties: {
                    ...properties,
                    DOB: formatDateOfBirth(properties)
                }
            };
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'Legal Identity returned', filterData)), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
            status: statusCode,
            headers: { "Content-Type": "application/json" }
        });
    }
}
