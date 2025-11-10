import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";

export async function POST(request) {
    try {
        const requestData = await request.json();

        // Accept both legacy and new shape
        // New: { page, limit: '10' | '25' | '50' | '100' | 'all', state, createdFrom, filter }
        // Legacy: { maxCount, offset, state, createdFrom, filter }
        const page = Number(requestData.page ?? 1);
        const rawLimit = String(requestData.limit ?? requestData.maxCount ?? "50").toLowerCase();
        const explicitOffset = requestData.offset; // keep supporting external offset if provided
        const state = requestData.state;
        const createdFrom = requestData.createdFrom;
        const filter = requestData.filter;

        const clientCookie = request.headers.get("Cookie");

        const dynamicHost = config.api.agent.runtime?.(request.headers) || config.api.agent.host;
        const url = `https://${dynamicHost}/LegalIdentities.ws`;

        // ---------- 1) TOTAL request: NO maxCount ----------
        // Only include filters/search-like fields; omit maxCount/offset entirely.
        const totalBody = {
            "strictSearch": "true",                   // keep as string to match your API
            filter: (filter?.FIRST ?? "") === "" ? {} : filter,
        };
        if (state) totalBody.state = state;
        if (createdFrom) totalBody.createdFrom = createdFrom;
       clientCookie
        const totalRes = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": clientCookie || "",
                "Accept": "application/json",
            },
            credentials: "include",
            mode: "cors",
            body: JSON.stringify(totalBody),
        });
        console.log("TOTAL response:", totalRes);
        const totalContentType = totalRes.headers.get("content-type") || "";
        const totalRaw = totalContentType.includes("application/json")
            ? await totalRes.json()
            : await totalRes.text();

        if (!totalRes.ok) {
            return new Response(
                JSON.stringify(new ResponseModel(totalRes.status, `Error counting: ${typeof totalRaw === "string" ? totalRaw : JSON.stringify(totalRaw)}`)),
                { status: totalRes.status, headers: { "Content-Type": "application/json" } }
            );
        }

        // total may be an array OR a number-like string/number
        const totalItems = Array.isArray(totalRaw)
            ? totalRaw.length
            : Number(totalRaw) || 0;

        // ---------- 2) DATA request (paged or ALL) ----------
        const isAll = rawLimit === "all";
        const limitNum = isAll ? Math.max(totalItems, 1) : Math.min(parseInt(rawLimit, 10) || 50, 100);

        // Prefer page-based offset if page was provided; otherwise honor explicit offset
        const computedOffset = isAll
            ? 0
            : explicitOffset != null
                ? Number(explicitOffset) || 0
                : (page - 1) * limitNum;

        const payload = {
            maxCount: limitNum,                      // when "all" -> totalItems
            offset: computedOffset,
            "strictSearch": "true",
            filter: (filter?.FIRST ?? "") === "" ? {} : filter,
        };
        if (state) payload.state = state;
        if (createdFrom) payload.createdFrom = createdFrom;

        // Debug logs (optional)
         console.log("TOTAL items:", totalItems);
        // console.log("Request Payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": clientCookie || "",
                "Accept": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
            mode: "cors",
        });
console.log(response)
        const contentType = response.headers.get("content-type") || "";
        const dataParsed = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            return new Response(
                JSON.stringify(new ResponseModel(response.status, `Error: ${typeof dataParsed === "string" ? dataParsed : JSON.stringify(dataParsed)}`)),
                { status: response.status, headers: { "Content-Type": "application/json" } }
            );
        }

        // Return both items and the true total
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
