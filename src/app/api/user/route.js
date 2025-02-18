import { NextResponse } from "next/server"

export async function POST(req){
    try {
        
        const { userId } = await req.json()
        
        
        if(!userId){
            return NextResponse.json({message:'Please provide with a userId'},{status:404})
        }
        
        const clientCookie = req.headers.get('Cookie')

        const res = await fetch('https://mateo.lab.tagroot.io/LegalIdentities.ws',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Cookie':clientCookie,
                'Accept':'application/json'
            },
            credentials:'include',
            body:JSON.stringify({
                'maxCount':20,
                'offset':0
            })
        })

        if(!res.ok){
            return NextResponse.json({message:`Something went wrong ${res.statusText} - ${res.status}`})
        }

            const data = await res.json()
       
            const decodedUserId = decodeURIComponent(userId);
            const findId = data.find((user) => (
                user.id === decodedUserId
            ))

            console.log('One User',findId)
            
            return NextResponse.json(findId,{status:200})
        

    } catch (error) {
        return NextResponse.json({ message: `Internal Server Error ${error}` }, { status: 500 })
    }
}