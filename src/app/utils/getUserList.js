'use server'
export async function getUserList(page = 1, limit = 5,query) {
    // Fetch mockdata with pagination values
    const res = await fetch(`${process.env.URL}/api/mockdata?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`, {
    })

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

    return await res.json()
}