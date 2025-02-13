'use server'


export async function getUser(userId){

    try {
        const res = await fetch(`${process.env.URL}/api/user`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({userId})
        })
        
        const data = await res.json()
       
        
        if(res.status !== 200){
            throw new Error(`Did not get the user ${data.message}`)
        }

        return data

    } catch (error) {
        throw new Error('Server Error, did not get userId',error)
    }

}