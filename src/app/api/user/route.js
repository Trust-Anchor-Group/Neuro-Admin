import { NextResponse } from "next/server"

export async function GET(req){
    try {
        
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('id')
        
        const clientCookie = req.headers.get('Cookie')
        
      
        if(!userId){
           return NextResponse.json({message:'Please provide with a userId'},{status:404})
        }

         const res = await fetch('https://mateo.lab.tagroot.io/LegalIdentities.ws',{
             method:'POST',
             headers:{
                 'Content-Type':'application/json',
                 'Cookie':clientCookie,
                 'Accept':'application/json'
             },
             credentials:'include',
             body:JSON.stringify({userId})
         })

            if(res.status !== 200){
                return NextResponse.json({message:`Could not retrieve data ${res.statusText}`},{status:404})
            }

            const data = await res.json()
    

            const findId = data.filter((user) => (
                user.id === userId
            ))
            
            return NextResponse.json(findId,{status:200})
        

    } catch (error) {
        return NextResponse.json({ message: `Internal Server Error ${error}` }, { status: 500 })
    }
}