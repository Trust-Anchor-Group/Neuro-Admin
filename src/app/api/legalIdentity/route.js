import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

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

            filterData = {
                Id: data.id,
                account: data.account,
                created: data.created,
                state: data.state,
                attachments: Array.isArray(data.attachments)
                    ? data.attachments.map(a => ({
                        data: a.data,
                        fileName: a.FileName
                    }))
                    : [],
                properties: {
                    // Personuppgifter
                    FIRST: data.properties.FIRST,
                    LAST: data.properties.LAST,
                    PNR: data.properties.PNR,
                    ADDR: data.properties.ADDR,
                    ZIP: data.properties.ZIP,
                    CITY: data.properties.CITY,
                    REGION: data.properties.REGION,
                    COUNTRY: data.properties.COUNTRY,
                    EMAIL: data.properties.EMAIL,
                    PHONE: data.properties.PHONE,
                    DOB: data.properties.DOB,

                    // Företagsuppgifter
                    ORGNAME: data.properties.ORGNAME,
                    ORGNR: data.properties.ORGNR,
                    ORGADDR: data.properties.ORGADDR,
                    ORGADDR2: data.properties.ORGADDR2,
                    ORGAREA: data.properties.ORGAREA,
                    ORGCITY: data.properties.ORGCITY,
                    ORGZIP: data.properties.ORGZIP,
                    ORGREGION: data.properties.ORGREGION,
                    ORGCOUNTRY: data.properties.ORGCOUNTRY,
                    ORGROLE: data.properties.ORGROLE
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
