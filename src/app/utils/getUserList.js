'use server'
export async function getUserList(page = 1, limit = 5,query) {
    // Fetch mockdata with pagination values
    const res = await fetch(`https://neuro-admin-dev-gnega5g4acbpfddm.germanywestcentral-01.azurewebsites.net/api/mockdata?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`, {
    })

    if (!res.ok) {
        throw new Error('Failed to fetch user data')
    }

    return await res.json()
}