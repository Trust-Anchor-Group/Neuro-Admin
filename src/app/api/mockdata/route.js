import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/config/config';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page') || '1', 10);
        const rawLimit = String(searchParams.get('limit') || '50').toLowerCase(); // supports 'all'
        const filterAccount = searchParams.get('filter') || 'all';
        const query = searchParams.get('query')?.toLowerCase() || '';

        // map filter -> fullId
        let fullId;
        if (filterAccount === 'hasID') fullId = true;
        else if (filterAccount === 'noID') fullId = false;
        else fullId = undefined;

        // cookies
        const cookieStore = await cookies();
        const clientCookieObject = cookieStore.get('HttpSessionID');
        const clientCookie = clientCookieObject
            ? `HttpSessionID=${encodeURIComponent(clientCookieObject.value)}`
            : '';

        const { host } = config.api.agent;
        const url = `https://${host}/Accounts.ws`;

        // ---------- 1) TOTAL request: NO maxCount ----------
        // Send only filters/search if present; otherwise empty body.
        const totalBody =
            typeof fullId === 'boolean' || query
                ? {
                    ...(typeof fullId === 'boolean' ? { fullId } : {}),
                    ...(query ? { strictSearch: false, fullTextSearch: query } : { filter: {} }),
                }
                : '';

        const totalRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json',
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify(totalBody),
        });

        if (!totalRes.ok) {
            const errText = await totalRes.text();
            return NextResponse.json(
                { message: `Error counting: ${totalRes.status}, ${errText}` },
                { status: 500 }
            );
        }

        const dataResponseTotalItems = await totalRes.json();
        console.log("dataResponseTotalItems:", dataResponseTotalItems);
        // Robust total: supports API returning array OR number
        const totalItems = Array.isArray(dataResponseTotalItems)
            ? dataResponseTotalItems.length
            : typeof dataResponseTotalItems === 'number'
                ? dataResponseTotalItems
                : 0;

        // ---------- 2) DATA request (paged or ALL) ----------
        const isAll = rawLimit === 'all';
        const limit = isAll ? Math.max(totalItems, 1) : Math.min(parseInt(rawLimit, 10) || 50, 100);

        const payload = {
            maxCount: limit,                             // when ALL -> totalItems
            offset: isAll ? 0 : (page - 1) * limit,
            ...(typeof fullId === 'boolean' ? { fullId } : {}),
            ...(query ? { strictSearch: false, fullTextSearch: query } : { filter: {} }),
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie,
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Error response text:', errorText);
            return NextResponse.json({ message: `Error: ${res.status}, ${errorText}` }, { status: 500 });
        }

        const data = await res.json();

        const filteredData = data.map((item) => ({
            country: item.country,
            created: item.created,
            email: item.eMail,
            firstName: item.firstName,
            lastNames: item.lastName,
            latestLegalId: item.latestLegalId,
            latestLegalIdState: item.latestLegalIdState,
            phoneNr: item.phoneNr,
            userName: item.userName,
        }));

        // Send totalItems (UI should compute pages = ceil(totalItems / limit))
        return NextResponse.json(
            {
                data: filteredData,
                totalPages: totalItems,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ message: `Internal Server Error ${error}` }, { status: 500 });
    }
}
