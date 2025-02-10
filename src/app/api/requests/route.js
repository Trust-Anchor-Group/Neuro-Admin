import { NextResponse } from "next/server";
import fs from 'fs'
import path from 'path'

let requests = [
  { id: 1, user: "Alice", requestedDate: "2025-01-30", accessLevel: "Admin" },
  { id: 2, user: "Bob", requestedDate: "2025-01-28", accessLevel: "Editor" }
];

// GET - Fetch requests
export async function GET() {
  const filePath = path.join(process.cwd(), 'src/app/api/userList.json')
        const jsonData = fs.readFileSync(filePath, 'utf-8')

        const users = JSON.parse(jsonData)
        console.log(users)
  return NextResponse.json(requests);
}

// PUT - Update request status
export async function PUT(req) {
  const { id, status } = await req.json();

  requests = requests.map(req => 
    req.id === id ? { ...req, status } : req
  );

  return NextResponse.json({ message: `Request ${id} marked as ${status}` });
}
