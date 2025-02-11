import { NextResponse } from "next/server"
import path from 'path'
import fs from 'fs'


export async function POST(req){
    try {
        
        const { userId } = await req.json()
      
        if(!userId){
           return NextResponse.json({message:'Please provide with a userId'},{status:404})
        }

            // const filePath = path.join(process.cwd(), 'src/app/api/userList.json')
            // const jsonData = fs.readFileSync(filePath, 'utf-8')
                
            // const users = JSON.parse(jsonData) 

            const res = await fetch('https://jsonplaceholder.typicode.com/users')
            const data = await res.json()
            console.log(data)

            const findId = data.filter((user) => (
                user.id === userId
            ))
            
            return NextResponse.json(findId,{status:200})
        

    } catch (error) {
        throw new Error('Server Error',error)
    }
}