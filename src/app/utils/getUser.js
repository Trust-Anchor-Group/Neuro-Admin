'use server'


export async function getUser(userId){

    try {
        const res = await fetch('http://localhost:3000/api/user',{
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