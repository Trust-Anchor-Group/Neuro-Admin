export async function getUserList() {
    
    const res = await fetch('http://localhost:3000/api/mockdata', {
    })

    if (!res.ok) {
        throw new Error('Failed to fetch user data')
    }

    return await res.json()
}