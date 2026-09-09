import ResponseModel from "@/models/ResponseModel";
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function POST(request) {
    try {
        const requestData = await request.json();

        const page = Number(requestData.page ?? 1);
        const rawLimit = String(requestData.limit ?? requestData.maxCount ?? "50").toLowerCase();
        const explicitOffset = requestData.offset;
        const state = requestData.state;
        const createdFrom = requestData.createdFrom;
        const filter = requestData.filter;

        const totalBody = {
            strictSearch: "true",
            filter: (filter?.FIRST ?? "") === "" ? {} : filter,
        };
        if (state) totalBody.state = state;
        if (createdFrom) totalBody.createdFrom = createdFrom;

        const { response: totalRes, body: totalRaw } = await fetchActiveNeuronJson(request, {
            path: '/LegalIdentities.ws',
            payload: totalBody,
        });

        if (!totalRes.ok) {
            return new Response(
                JSON.stringify(new ResponseModel(totalRes.status, `Error counting: ${typeof totalRaw === "string" ? totalRaw : JSON.stringify(totalRaw)}`)),
                { status: totalRes.status, headers: { "Content-Type": "application/json" } }
            );
        }

        const totalItems = Array.isArray(totalRaw)
            ? totalRaw.length
            : Number(totalRaw) || 0;

        const isAll = rawLimit === "all";
        const limitNum = isAll ? Math.max(totalItems, 1) : Math.min(parseInt(rawLimit, 10) || 50, 100);
        const computedOffset = isAll
            ? 0
            : explicitOffset != null
                ? Number(explicitOffset) || 0
                : (page - 1) * limitNum;

        const payload = {
            maxCount: limitNum,
            offset: computedOffset,
            strictSearch: "true",
            filter: (filter?.FIRST ?? "") === "" ? {} : filter,
        };
        if (state) payload.state = state;
        if (createdFrom) payload.createdFrom = createdFrom;

        const { response, body: dataParsed } = await fetchActiveNeuronJson(request, {
            path: '/LegalIdentities.ws',
            payload,
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify(new ResponseModel(response.status, `Error: ${typeof dataParsed === "string" ? dataParsed : JSON.stringify(dataParsed)}`)),
                { status: response.status, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify(new ResponseModel(200, "", { items: dataParsed, totalItems })),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error fetching legal identities:", error);
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        return new Response(
            JSON.stringify(new ResponseModel(statusCode, message)),
            { status: statusCode, headers: { "Content-Type": "application/json" } }
        );
    }
}
