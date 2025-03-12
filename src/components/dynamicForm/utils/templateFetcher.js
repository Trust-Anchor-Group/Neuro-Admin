export default async function templateFetcher(uri) {
    try {
        const response = await fetch(uri, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Response not ok: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Could not fetch form template: ${error.message}`);
    }
};