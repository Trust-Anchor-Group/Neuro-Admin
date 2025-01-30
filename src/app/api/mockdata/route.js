import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';


export async function GET(req,res){
    try {
        
        const filePath = path.join(process.cwd(),'src/app/api/userList.json')
        console.log(filePath)

        
        const jsonData = fs.readFileSync(filePath,'utf-8')
        
        const users = JSON.parse(jsonData);
        return NextResponse.json(users,{status:200})

    } catch (error) {
        return NextResponse.json({message:'Internal Server Error'},{status:500})
    }
}