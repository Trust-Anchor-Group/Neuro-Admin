import { NextResponse } from "next/server"

export async function POST(req){
    try {
        
        const { userId } = await req.json()
      
        if(!userId){
           return NextResponse.json({message:'Please provide with a userId'},{status:404})
        }

            const res = await fetch('https://jsonplaceholder.typicode.com/users')

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