import { NextResponse } from 'next/server';
import { fetchActiveNeuronJson } from '@/lib/neuronUpstream';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page') || '1', 10);
        const rawLimit = String(searchParams.get('limit') || '50').toLowerCase();
        const filterAccount = searchParams.get('filter') || 'all';
        const query = searchParams.get('query')?.toLowerCase() || '';

        let fullId;
        if (filterAccount === 'hasID') fullId = true;
        else if (filterAccount === 'noID') fullId = false;
        else fullId = undefined;

        const totalBody = {
            ...(typeof fullId === 'boolean' ? { fullId } : {}),
            ...(query ? { strictSearch: false, fullTextSearch: query } : { filter: {} }),
        };

        const { response: totalRes, body: dataResponseTotalItems } = await fetchActiveNeuronJson(req, {
            path: '/Accounts.ws',
            payload: totalBody,
        });

        if (!totalRes.ok) {
            return NextResponse.json(
                { message: `Error counting: ${totalRes.status}, ${dataResponseTotalItems}` },
                { status: 500 }
            );
        }

        const totalCandidates = [
            Array.isArray(dataResponseTotalItems) ? dataResponseTotalItems.length : null,
            Array.isArray(dataResponseTotalItems?.data) ? dataResponseTotalItems.data.length : null,
            Array.isArray(dataResponseTotalItems?.items) ? dataResponseTotalItems.items.length : null,
            Number.isFinite(Number(dataResponseTotalItems?.totalItems)) ? Number(dataResponseTotalItems.totalItems) : null,
            Number.isFinite(Number(dataResponseTotalItems?.total)) ? Number(dataResponseTotalItems.total) : null,
            Number.isFinite(Number(dataResponseTotalItems?.count)) ? Number(dataResponseTotalItems.count) : null,
            typeof dataResponseTotalItems === 'number' ? dataResponseTotalItems : null,
        ];
        const totalItems = totalCandidates.find((value) => Number.isFinite(value) && value >= 0) ?? 0;

        const isAll = rawLimit === 'all';
        const limit = isAll ? Math.max(totalItems, 1) : Math.min(parseInt(rawLimit, 10) || 50, 100);

        const payload = {
            maxCount: limit,
            offset: isAll ? 0 : (page - 1) * limit,
            ...(typeof fullId === 'boolean' ? { fullId } : {}),
            ...(query ? { strictSearch: false, fullTextSearch: query } : { filter: {} }),
        };

        const { response: res, body: data } = await fetchActiveNeuronJson(req, {
            path: '/Accounts.ws',
            payload,
        });

        if (!res.ok) {
            return NextResponse.json({ message: `Error: ${res.status}, ${data}` }, { status: 500 });
        }

        const dataRows = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];

        const filteredData = dataRows.map((item) => ({
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
