import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';


export async function GET(req,res){
    try {
        
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '5',10)

        // Fetch MockData api
        const filePath = path.join(process.cwd(),'src/app/api/userList.json')        
        const jsonData = fs.readFileSync(filePath,'utf-8')
        
        
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        
        const users = JSON.parse(jsonData);
        const paginatedUsers = users.slice(startIndex,endIndex)

        const response = {
            data:paginatedUsers,
            totalPages:Math.ceil(users.length / limit),
        }

        return NextResponse.json(response,{status:200})

    } catch (error) {
        return NextResponse.json({message:'Internal Server Error'},{status:500})
    }
}