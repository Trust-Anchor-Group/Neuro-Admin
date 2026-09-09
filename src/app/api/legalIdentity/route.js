import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(request) {
    const requestData = await request.json();
    const { legalIdentity } = requestData;
    const decodedUserId = decodeURIComponent(legalIdentity);

    const payload = { id: decodedUserId };
    console.log('LegalId Fetch', payload);

    try {
        const { response, body } = await fetchActiveNeuronJson(request, {
            path: '/legalIdentity.ws',
            payload,
        });

        let filterData;

        if (body && typeof body === 'object') {
            console.log('Legal Identity Data', body);

            filterData = {
                Id: body.id,
                account: body.account,
                created: body.created,
                state: body.state,
                attachments: Array.isArray(body.attachments)
                    ? body.attachments.map((attachment) => ({
                        data: attachment.data,
                        fileName: attachment.FileName
                    }))
                    : [],
                properties: {
                    FIRST: body.properties?.FIRST,
                    LAST: body.properties?.LAST,
                    PNR: body.properties?.PNR,
                    ADDR: body.properties?.ADDR,
                    ZIP: body.properties?.ZIP,
                    CITY: body.properties?.CITY,
                    REGION: body.properties?.REGION,
                    COUNTRY: body.properties?.COUNTRY,
                    EMAIL: body.properties?.EMAIL,
                    PHONE: body.properties?.PHONE,
                    DOB: body.properties?.DOB,
                    SPORT: body.properties?.SPORT,
                    SPORTINGLICENSE: body.properties?.SPORTINGLICENSE,
                    SPORTASSOCIATION: body.properties?.SPORTASSOCIATION,
                    ORGNAME: body.properties?.ORGNAME,
                    ORGNR: body.properties?.ORGNR,
                    ORGADDR: body.properties?.ORGADDR,
                    ORGADDR2: body.properties?.ORGADDR2,
                    ORGAREA: body.properties?.ORGAREA,
                    ORGCITY: body.properties?.ORGCITY,
                    ORGZIP: body.properties?.ORGZIP,
                    ORGREGION: body.properties?.ORGREGION,
                    ORGCOUNTRY: body.properties?.ORGCOUNTRY,
                    ORGROLE: body.properties?.ORGROLE
                }
            };
        }

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${body}`)), {
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
