'use server'


export async function getUser(userId){

    try {
        const res = await fetch(`https://neuro-admin-dev-gnega5g4acbpfddm.germanywestcentral-01.azurewebsites.net/api/user`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({userId})
        })
    
        const data = await res.json()
        console.log(data)
    
        if(!data){
            throw new Error('Something went wrong')
        }

        return data
    } catch (error) {
        console.log(error)
    }

}